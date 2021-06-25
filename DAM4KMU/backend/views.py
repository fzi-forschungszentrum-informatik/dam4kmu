import re
from django.http import HttpResponse
from datetime import datetime
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core import serializers
from .models import Asset

def home(request):
    print(f"request: {request}")
    return HttpResponse("Hello, Django!")

def requirement(request, name):
    now = datetime.now()
    formatted_now = now.strftime("%A, %d %B, %Y at %X")

    # Filter the name argument to letters only using regular expressions. URL arguments
    # can contain arbitrary text, so we restrict to safe characters only.
    match_object = re.match("[a-zA-Z]+", name)

    if match_object:
        clean_name = match_object.group(0)
    else:
        clean_name = "Friend"

    content = "Hello there, " + clean_name + "! It's " + formatted_now
    return HttpResponse(content)

@receiver(post_save, sender=Asset)
def refresh_view(sender, **kwargs):
    assets = sender.objects.all()
    jsonString = ""
    for asset in assets:
        serialized_obj = serializers.serialize('json', [asset])
        jsonString += "\n" + str(serialized_obj)
    print(jsonString)