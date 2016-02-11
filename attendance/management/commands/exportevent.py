import csv
import re
import sys
from datetime import datetime

from django.core.management.base import BaseCommand, CommandError
from pytz import UTC

from attendance.models import Event


class Command(BaseCommand):
    help = 'Export names for an event'

    def add_arguments(self, parser):
        parser.add_argument('date', help='Date of the event (%Y-%m-%d)')
        parser.add_argument('--format', default='csv', choices=['csv', 'json'])

    def handle(self, *args, **options):
        date_option = options['date']
        try:
            dt = datetime.strptime(options['date'], '%Y-%m-%d')
        except ValueError:
            raise CommandError('Invalid date format')

        date = dt.replace(tzinfo=UTC).date()
        events = Event.objects.filter(datetime__date=date)
        if events.count() == 0:
            raise CommandError('No event found!')
        if events.count() == 1:
            event = events.first()
        else:
            # prompt for which event to export
            events = list(events)
            self.stdout.write('Multiple events found in {}'.format(date_option))
            self.stdout.write('Please select an event:')
            for i, e in enumerate(events):
                self.stdout.write('({}): {}'.format(i, e.name))

            try:
                num = int(input('Export event #: '))
            except ValueError:
                raise CommandError('Invalid event number')

            try:
                event = events[num]
            except IndexError:
                raise CommandError('Invalid event number')

        fmt = options['format']
        if fmt == 'csv':
            self.export_csv(event)
        else:
            raise CommandError('Other formats not yet supported')

    @staticmethod
    def export_csv(event, stream=sys.stdout):
        writer = csv.writer(sys.stdout)
        writer.writerow(['Name'])
        for attendee in event.attendees.only('name'):
            # clean name up a bit
            name = re.sub('\s+', ' ', attendee.name).strip()
            writer.writerow([name])
