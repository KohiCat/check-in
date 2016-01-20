from django.test import TestCase
from attendance.forms import CardSwipeForm


class SwipeFormTests(TestCase):
    def test_parses_student_id(self):
        form_data = {
            'swipe': '%B7989142181070636^LAST/FIRST M         ^'
                     '014546611094120       000      ?;'
                     '3095193769558739=54960723825369019715?'
        }
        form = CardSwipeForm(data=form_data)
        self.assertTrue(form.is_valid())
        self.assertEqual(form.cleaned_data['swipe'], 'First M Last')

    def test_parses_fl_driver_license(self):
        form_data = {
            'swipe': '%FLORLANDO^LAST$FIRST$MIDDLE^123 COOL ST?;'
                     '9562020272902437403=7597808483877=?+! 32816  '
                     'E               2188'
                     '                                   ECCECC00000?'
        }
        form = CardSwipeForm(data=form_data)
        self.assertTrue(form.is_valid())
        self.assertEqual(form.cleaned_data['swipe'], 'First Middle Last')

    def test_parses_no_middle_name(self):
        form_data = {
            'swipe': '%B7989142181070636^LAST/FIRST         ^'
                     '014546611094120       000      ?;'
                     '3095193769558739=54960723825369019715?'
        }
        form = CardSwipeForm(data=form_data)
        self.assertTrue(form.is_valid())
        self.assertEqual(form.cleaned_data['swipe'], 'First Last')
