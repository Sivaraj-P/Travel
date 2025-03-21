from django.db import models
from django.contrib.auth.models import User




class Project(models.Model):
    name=models.CharField(max_length=255)
    is_active=models.BooleanField()
    description=models.CharField(max_length=255)

    def __str__(self):
        return self.name
    

TRAVEL_MODE=(
    ("flight","BY FLIGHT"),
    ("train","BY TRAIN"),
    ("cab","BY CAB"),
)


class Travel(models.Model):
    user=models.ForeignKey(User,on_delete=models.PROTECT,related_name="user_travel")
    project=models.ForeignKey(Project,on_delete=models.PROTECT,related_name="project_travel")
    purpose=models.CharField(max_length=255)
    date=models.DateField()
    mode=models.CharField(max_length=20,choices=TRAVEL_MODE)
    start_location=models.CharField(max_length=50)
    end_location=models.CharField(max_length=50)
    status=models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.username} - {self.project.name}"