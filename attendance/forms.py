import re

from django import forms

from attendance.models import Event


class MagStripeNameField(forms.CharField):
    TRACK_1_PARSE_ERROR = 'Could not parse track 1'

    def to_python(self, value):
        value = super().to_python(value)
        track_1 = value.split('?')[0]
        if track_1.startswith('%E?'):
            raise forms.ValidationError('Track 1 not found')

        # some financial card
        if track_1.startswith('%B'):
            track_1 = track_1.lstrip('%B')
            try:
                pan, name, data = track_1.split('^')
            except ValueError:
                raise forms.ValidationError(self.TRACK_1_PARSE_ERROR)

            name = name.strip()
            name_parts = [x.strip().capitalize() for x in
                          re.split(r'[/\s]', name)]

        # driver's license
        else:
            track_1 = track_1.lstrip('%')
            try:
                name = track_1.split('^')[1]
            except (ValueError, IndexError):
                raise forms.ValidationError(self.TRACK_1_PARSE_ERROR)

            name = name.strip()
            name_parts = [x.strip().capitalize() for x in name.split('$')]

        surname = name_parts[0]
        rest_of_name = ' '.join(name_parts[1:])
        full_name = '{} {}'.format(rest_of_name, surname)

        # no digits allowed, just in case
        if re.search(r'\d', full_name):
            raise forms.ValidationError('Digits found in parsed name')

        return full_name


class CardSwipeForm(forms.Form):
    swipe = MagStripeNameField(max_length=255, required=True)


class EventModelForm(forms.ModelForm):
    class Meta:
        model = Event
        fields = ['name', 'datetime']
