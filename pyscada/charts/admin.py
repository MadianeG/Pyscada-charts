# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from typing import Any, Optional

from django.http import HttpRequest

from pyscada.models import Variable

from django import forms
from pyscada.charts.models import ApexChart, D3Category, D3Chart, ChartLibrarie
from pyscada.admin import admin_site
from django.contrib import admin


import logging

logger = logging.getLogger(__name__)

class ChartApexForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        super(ChartApexForm, self).__init__(*args, **kwargs)


class ChartApexAdmin(admin.ModelAdmin):
    list_per_page = 100
    # ordering = ['position',]
    search_fields = ['title', ]
    List_display_link = ('title',)
    list_display = ('id', 'title','x_axis_label', 'y_axis_label',)
    #list_filter = ('widget__page__title', 'widget__title',)
    form = ChartApexForm
    save_as = True
    save_as_continue = True

    def name(self, instance):
        return instance.variables.name

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == 'apexChart_x_axis_var':
            kwargs['empty_label'] = "Time series"
        return super(ChartApexAdmin, self).formfield_for_foreignkey(db_field, request, **kwargs)


class ChartD3Form(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        super(ChartD3Form, self).__init__(*args, **kwargs)
        wtf = Variable.objects.all()
        w = self.fields['variables'].widget
        choices = []
        for choice in wtf:
            choices.append((choice.id, choice.name + '( ' + choice.unit.description + ' )'))
        w.choices = choices


class ChartD3Inline(admin.TabularInline):
    model = D3Category
    filter_vertical = ['variables']

    def get_extra(self, request, obj=None, **kwargs):
        return 0 if obj else 1


class ChartD3Admin(admin.ModelAdmin):
    list_per_page = 100
    # ordering = ['position',]
    search_fields = ['title', ]
    List_display_link = ('title',)
    list_display = ('id', 'title',)
    #list_filter = ('widget__page__title', 'widget__title',)
    #form = ChartForm
    save_as = True
    save_as_continue = True
    inlines = [ChartD3Inline]

    def name(self, instance):
        return instance.variables.name

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == 'category_var':
            kwargs['empty_label'] = ""
        return super(ChartD3Admin, self).formfield_for_foreignkey(db_field, request, **kwargs)


#Librairies

class ChartLibrarieAdmin(admin.ModelAdmin):
    list_display = ('id', 'title',)
    list_display_links = ('id', 'title',)
    save_as = True
    save_as_continue = True


admin_site.register(D3Chart, ChartD3Admin)
admin_site.register(ApexChart, ChartApexAdmin)
admin_site.register(ChartLibrarie, ChartLibrarieAdmin)