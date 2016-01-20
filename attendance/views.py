import json

from django.contrib.auth.decorators import login_required
from django.db.models import Count
from django.http import HttpResponse, HttpResponseBadRequest
from django.shortcuts import render, get_object_or_404
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_POST, require_safe

from attendance.forms import CardSwipeForm, EventModelForm
from attendance.models import Event, Attendee, Attendance

GENERIC_SUCCESS = {'success': True}


class JSONResponse(HttpResponse):
    def __init__(self, *args, **kwargs):
        if 'content' in kwargs:
            content = kwargs['content']
            del kwargs['content']
        elif len(args) > 0:
            content = args[0]
        else:
            content = {}

        if isinstance(content, str):
            try:
                json.loads(content)
            except json.JSONDecodeError:
                content = json.dumps(content)
        else:
            content = json.dumps(content)

        new_args = (content,) + args[1:]
        kwargs['content_type'] = 'application/json'
        super().__init__(*new_args, **kwargs)


class JSONErrorResponse(HttpResponseBadRequest, JSONResponse):
    pass


@login_required
@require_safe
@ensure_csrf_cookie
def index(request):
    return render(request, 'index.html')


@login_required
@require_safe
def events(request):
    events = []
    for event in Event.objects.order_by('-datetime').all().annotate(
            num_attendees=Count('attendees')):
        logs = []
        for attendance in event.attendances.order_by('timestamp'):
            logs.append({
                'message': 'Scanned {}'.format(attendance.attendee.name),
                'timestamp': attendance.timestamp.timestamp()
            })
        events.append({
            'id': event.id,
            'name': event.name,
            'datetime': event.datetime.timestamp(),
            'num_attendees': event.num_attendees,
            'logs': logs
        })
    return JSONResponse({'events': events})


@login_required
@require_POST
def new_event(request):
    form = EventModelForm(request.POST)
    if form.is_valid():
        event = form.save()
        modified_response = GENERIC_SUCCESS.copy()
        modified_response['event'] = {'id': event.id}
        return JSONResponse(modified_response)

    return JSONErrorResponse({'errors': form.errors})


@login_required
@require_POST
def attend(request, id):
    event = get_object_or_404(Event, id=id)
    form = CardSwipeForm(request.POST)
    if not form.is_valid():
        return JSONErrorResponse({'errors': form.errors})

    name = form.cleaned_data['swipe']
    attendee, _ = Attendee.objects.get_or_create(name=name)
    attendee.save()
    if event.attendees.filter(id=attendee.id).exists():
        return JSONErrorResponse({'errors': {
            'swipe': ['Attendee already swiped into event']
        }})

    attendance = Attendance.objects.create(event=event, attendee=attendee)
    jresponse = GENERIC_SUCCESS.copy()
    jresponse['log'] = {
        'message': 'Scanned {}'.format(name),
        'timestamp': attendance.timestamp.timestamp()
    }
    return JSONResponse(jresponse)


@login_required
@require_POST
def update(request, id):
    queryset = Event.objects.annotate(num_attendees=Count('attendees'))
    event = get_object_or_404(queryset, id=id)
    form = EventModelForm(request.POST, instance=event)
    if not form.is_valid():
        return JSONErrorResponse({'errors': form.errors})

    event = form.save()
    logs = []
    for attendance in event.attendances.order_by('timestamp'):
        logs.append({
            'message': 'Scanned {}'.format(attendance.attendee.name),
            'timestamp': attendance.timestamp.timestamp()
        })
    jresponse = GENERIC_SUCCESS.copy()
    jresponse['event'] = {
        'id': event.id,
        'name': event.name,
        'datetime': event.datetime.timestamp(),
        'num_attendees': event.num_attendees,
        'logs': logs
    }
    return JSONResponse(jresponse)


@login_required
@require_POST
def delete_event(request):
    try:
        event = Event.objects.get(id=request.POST['id'])
    except KeyError:
        return JSONErrorResponse({'errors': {'id': 'id required'}})
    except Event.DoesNotExist:
        return JSONErrorResponse({'errors': {'id': 'Invalid Event ID'}})

    event.delete()
    return JSONResponse(GENERIC_SUCCESS)