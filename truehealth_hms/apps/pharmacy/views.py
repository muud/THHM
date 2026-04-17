from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponse, JsonResponse
from django.db import transaction
from .models import DrugBatch, Prescription, StockMovement, Dispensing, RefillRequest
from django.contrib import messages
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from datetime import date, timedelta

def dashboard(request):
    """
    Renders the dedicated patient pharmacy dashboard.
    """
    return render(request, 'pharmacy/dashboard.html')

from django.db.models import F
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.decorators import permission_classes

def staff_dashboard(request):
    """
    Shows low stock, expiry alerts, and pending prescriptions for pharmacists.
    """
    today = date.today()
    all_batches = DrugBatch.objects.all().select_related('drug')
    low_stock = [b for b in all_batches if b.quantity <= b.drug.reorder_level]
    expiring_soon = [b for b in all_batches if b.expiry_date <= today + timedelta(days=30)]
    pending_prescriptions = Prescription.objects.filter(is_dispensed=False).order_by('-date_prescribed')
    
    context = {
        'low_stock': low_stock,
        'expiring_soon': expiring_soon,
        'pending_prescriptions': pending_prescriptions,
        'all_batches': all_batches,
    }
    return render(request, 'pharmacy/staff_dashboard.html', context)

@api_view(['POST'])
@permission_classes([IsAuthenticated])  # Or a more strict permission
def dispense_prescription(request):
    pres_id = request.data.get('prescription_id')
    prescription = get_object_or_404(Prescription, id=pres_id)
    if prescription.is_dispensed:
        return Response({'error': 'Already dispensed'}, status=400)
    
    # Check stock and reduce
    for item in prescription.items.all():
        batch = item.drug_batch
        if batch.quantity < item.quantity:
            return Response({'error': f'Insufficient stock for {batch.drug.name}'}, status=400)
        
        batch.quantity -= item.quantity
        batch.save()
        
        # Log stock movement
        StockMovement.objects.create(
            drug_batch=batch,
            movement_type='OUT',
            quantity=item.quantity,
            reference=f"PRESC-{prescription.id}",
            performed_by=request.user
        )
        
    prescription.is_dispensed = True
    prescription.save()
    return Response({'status': 'dispensed'})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def stock_in(request):
    batch_id = request.data.get('batch_id')
    qty = request.data.get('quantity')
    if not (batch_id and qty):
        return Response({'error': 'Missing batch_id or quantity'}, status=400)
    
    batch = get_object_or_404(DrugBatch, id=batch_id)
    batch.quantity += int(qty)
    batch.save()
    
    # Log stock movement
    StockMovement.objects.create(
        drug_batch=batch,
        movement_type='IN',
        quantity=qty,
        reference="MANUAL-STOCK-IN",
        performed_by=request.user
    )
    return Response({'status': 'stock added'})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def stock_out(request):
    batch_id = request.data.get('batch_id')
    qty = request.data.get('quantity')
    if not (batch_id and qty):
        return Response({'error': 'Missing batch_id or quantity'}, status=400)
        
    batch = get_object_or_404(DrugBatch, id=batch_id)
    if batch.quantity < int(qty):
        return Response({'error': 'Not enough stock'}, status=400)
    
    batch.quantity -= int(qty)
    batch.save()
    
    # Log stock movement
    StockMovement.objects.create(
        drug_batch=batch,
        movement_type='OUT',
        quantity=qty,
        reference="MANUAL-STOCK-OUT",
        performed_by=request.user
    )
    return Response({'status': 'stock removed'})

@transaction.atomic
def stock_in(request):
    """
    Record a purchase/restock movement and increase DrugBatch quantity.
    """
    if request.method == 'POST':
        batch_id = request.POST.get('batch_id')
        quantity = int(request.POST.get('quantity', 0))
        reference = request.POST.get('reference', 'MANUAL-STOCK-IN')
        
        if quantity <= 0:
            messages.error(request, "Quantity must be greater than zero.")
            return redirect('pharmacy:staff_dashboard')
            
        batch = get_object_or_404(DrugBatch, id=batch_id)
        batch.quantity += quantity
        batch.save()
        
        StockMovement.objects.create(
            drug_batch=batch,
            movement_type='IN',
            quantity=quantity,
            reference=reference,
            performed_by=request.user
        )
        
        messages.success(request, f"Successfully added {quantity} units to {batch.drug.name} (Batch: {batch.batch_number}).")
    
    return redirect('pharmacy:staff_dashboard')

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def request_refill(request):
    prescription_id = request.data.get('prescription_id')
    try:
        prescription = Prescription.objects.get(id=prescription_id, patient=request.user.patient)
        # For now, just mark a flag as requested
        prescription.refill_requested = True
        prescription.save()
        
        # Also create a formal RefillRequest record
        RefillRequest.objects.create(
            prescription=prescription,
            patient=request.user.patient,
            status='pending'
        )
        return Response({'status': 'refill requested'})
    except Prescription.DoesNotExist:
        return Response({'error': 'Prescription not found'}, status=404)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_prescriptions(request):
    patient = request.user.patient
    prescriptions = Prescription.objects.filter(patient=patient, is_dispensed=False).prefetch_related('items__drug_batch__drug')
    data = []
    for pres in prescriptions:
        item = pres.items.first()
        if item:
            data.append({
                'id': pres.id,
                'drug': item.drug_batch.drug.name,
                'dosage': item.dosage,
                'remaining': 10  # mock, you can calculate from quantity
            })
    return Response(data)

def index(request):
    return render(request, 'placeholder.html')
