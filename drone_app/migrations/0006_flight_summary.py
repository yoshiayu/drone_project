# Generated by Django 4.2.4 on 2023-09-18 02:41

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('drone_app', '0005_alter_flightrecord_summary'),
    ]

    operations = [
        migrations.AddField(
            model_name='flight',
            name='summary',
            field=models.TextField(blank=True, null=True),
        ),
    ]
