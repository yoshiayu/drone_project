from datetime import timezone
from django.shortcuts import get_object_or_404, render, redirect
from .models import Flight
from .forms import FlightForm
import csv
from django.http import HttpResponse

def home(request):
    return render(request, 'new_flight.html')

def flight_detail(request, flight_id):
    flight = get_object_or_404(Flight, pk=flight_id)
    return render(request, 'flight_detail.html', {'flight': flight})

def new_flight(request):
    if request.method == 'POST':
        form = FlightForm(request.POST)
        if form.is_valid():
            flight = form.save()
            flight.takeoff_time = timezone.now()
            flight.save()
            return redirect('flight_detail', flight_id=flight.id)
        else:
            form = FlightForm()
        return render(request, 'new_flight.html', {'form': form})

def export_flights_csv(request):
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="flights.csv"'

    writer = csv.writer(response)
    writer.writerow(['飛行日', '操縦者', '離陸時間', '着陸時間', '離陸地点', '着陸地点'])

    for flight in Flight.objects.all():
        writer.writerow([flight.date, flight.pilot, flight.takeoff_time, flight.landing_time, flight.takeoff_location, flight.landing_location])

    return response