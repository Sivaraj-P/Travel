# Generated by Django 5.1.7 on 2025-03-19 16:57

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='travel',
            name='status',
            field=models.BooleanField(default=False),
        ),
    ]
