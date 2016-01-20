from django.db import models


class Event(models.Model):
    name = models.CharField(max_length=255)
    datetime = models.DateTimeField()

    class Meta:
        unique_together = ('name', 'datetime')


class Attendance(models.Model):
    event = models.ForeignKey('Event', on_delete=models.CASCADE,
                              related_name='attendances')
    attendee = models.ForeignKey('Attendee', on_delete=models.CASCADE,
                                 related_name='attendances')
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return '{} at {}'.format(self.attendee.name, self.event.name)


class Attendee(models.Model):
    name = models.CharField(max_length=255)
    events = models.ManyToManyField(Event, through='Attendance',
                                    related_name='attendees')

    def __str__(self):
        return self.name