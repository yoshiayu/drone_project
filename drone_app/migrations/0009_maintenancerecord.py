# Generated by Django 4.2.4 on 2023-09-20 11:52

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('drone_app', '0008_alter_flight_landing_time_alter_flight_takeoff_time_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='MaintenanceRecord',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('inspection_item', models.CharField(max_length=100)),
                ('inspection_content', models.TextField()),
                ('result', models.BooleanField()),
                ('remarks', models.TextField(blank=True, null=True)),
                ('location', models.TextField()),
                ('date', models.DateField()),
                ('inspector', models.CharField(max_length=100)),
            ],
        ),
    ]