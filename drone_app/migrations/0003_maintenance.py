# Generated by Django 4.2.4 on 2023-09-02 07:14

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('drone_app', '0002_flightrecord_flight_landing_location_lat_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='Maintenance',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('coordinate_data', models.CharField(max_length=255, verbose_name='座標データ')),
                ('flight_date', models.DateField(verbose_name='飛行日')),
                ('pilot_data', models.CharField(max_length=100, verbose_name='操縦者')),
            ],
        ),
    ]