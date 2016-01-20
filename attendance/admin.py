from django.contrib import admin
from attendance.models import Event, Attendee, Attendance


class AttendanceInline(admin.TabularInline):
    model = Attendance


class EventAdmin(admin.ModelAdmin):
    list_display = ('name', 'datetime')
    search_fields = ('name',)

    inlines = [
        AttendanceInline
    ]

class AttendeeAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('events',)

admin.site.register(Event, EventAdmin)
admin.site.register(Attendee, AttendeeAdmin)