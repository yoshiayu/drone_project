# Generated by Django 4.2.4 on 2023-09-18 02:48

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('drone_app', '0007_alter_flight_summary_alter_flightrecord_summary'),
    ]

    operations = [
        migrations.AlterField(
            model_name='flight',
            name='landing_time',
            field=models.TimeField(verbose_name='着陸時間'),
        ),
        migrations.AlterField(
            model_name='flight',
            name='takeoff_time',
            field=models.TimeField(verbose_name='離陸時間'),
        ),
        migrations.AlterField(
            model_name='flightrecord',
            name='landing_time',
            field=models.TimeField(verbose_name='着陸時間'),
        ),
        migrations.AlterField(
            model_name='flightrecord',
            name='takeoff_time',
            field=models.TimeField(verbose_name='離陸時間'),
        ),
    ]
