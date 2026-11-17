from django.contrib import admin

from .models import Destination, Expense, Trip, TripPhoto

admin.site.register(Destination)
admin.site.register(Trip)
admin.site.register(TripPhoto)
admin.site.register(Expense)
