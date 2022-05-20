# -*- coding: utf-8 -*-
from __future__ import unicode_literals
import logging
from pyscada.hmi.models import WidgetContentModel, WidgetContent
from pyscada.models import Variable, Category
from django.db import models
from django.template.loader import get_template
from six import text_type
from django.conf import settings

STATIC_URL = str(settings.STATIC_URL) if hasattr(settings, 'STATIC_URL') else 'static'

logger = logging.getLogger(__name__)

#
# Libraries
#
class ChartLibrarie(models.Model):
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=400, default='')
    link = models.CharField(max_length=400, default='')

    def __str__(self) :
        return self.title

class ApexChart(WidgetContentModel):
    id = models.AutoField(primary_key=True)

    title = models.CharField(max_length=400, default='')
    x_axis_label = models.CharField(max_length=400, default='', blank=True)
    y_axis_label = models.CharField(max_length=400, default='', blank=True)

    variables = models.ManyToManyField(Variable, blank=True)

    library = models.ForeignKey(ChartLibrarie, default=None, related_name='libraryLinky', null=True, blank=True,
                                   on_delete=models.SET_NULL)

    type_choices = (
        (0, 'Bar'),
        (1, 'Line'),
    )

    type = models.PositiveSmallIntegerField(default=0, choices=type_choices)

    def __str__(self):
        return text_type(str(self.id) + ': ' + self.title)

    def visible(self):
        return True

    def variables_list(self, exclude_list=[]):
        list = []
        for axe in self.chart_set.all():
            for item in axe.variables.exclude(pk__in=exclude_list):
                list.append(item)
        return list

    def values(self):
        allValues = []
        for xVariable in self.variables.all():
            for xValue in xVariable:
                allValues.append(xValue)
        return allValues

    def xMin(self):
        return 0
        return min(self.values(self))

    def xMax(self):
        return 100
        return max(self.values(self))

    def gen_html(self, **kwargs):
        """

        :return: main panel html and sidebar html as
        """
        widget_pk = kwargs['widget_pk'] if 'widget_pk' in kwargs else 0
        main_template = get_template('chartApex.html')
        sidebar_template = get_template('chartApex_legend.html')
        main_content = main_template.render(dict(chartApex=self, widget_pk=widget_pk))
        sidebar_content = sidebar_template.render(dict(chart=self, widget_pk=widget_pk, chart_legend_html='_chartApex_legend.html',))
        opts = {'show_daterangepicker': True, 'show_timeline': True,}
        opts['javascript_files_list'] = [STATIC_URL + 'pyscada/js/charts/apexcharts.js',
        STATIC_URL + 'pyscada/js/jquery/jquery.tablesorter.min.js',
        STATIC_URL + 'pyscada/js/charts/PyScadaApexCharts.js',
        ]
        return main_content, sidebar_content, opts

class D3Chart(WidgetContentModel):
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=400, default='')

    def __str__(self):
        return text_type(str(self.id) + ': ' + self.title)

    def visible(self):
        return True

    def gen_html(self, **kwargs):
        """

        :return: main panel html
        """
        widget_pk = kwargs['widget_pk'] if 'widget_pk' in kwargs else 0
        main_template = get_template('chartD3.html')
        sidebar_template = get_template('chartD3_legend.html')
        main_content = main_template.render(dict(chartD3=self, widget_pk=widget_pk))
        sidebar_content = sidebar_template.render(dict(chart=self, widget_pk=widget_pk, chart_legend_html='_chartD3_legend.html',))
        opts = {'show_daterangepicker': True, 'show_timeline': True,}
        opts['javascript_files_list'] = [STATIC_URL + 'pyscada/js/charts/d3.js',
        STATIC_URL + 'pyscada/js/jquery/jquery.tablesorter.min.js',
        STATIC_URL + 'pyscada/js/charts/PyScadaD3.js',
        ]
        return main_content, sidebar_content, opts

    def _get_objects_for_html(self, list_to_append=None, obj=None, exclude_model_names=None):
        list_to_append = super()._get_objects_for_html(list_to_append, obj, exclude_model_names)
        if obj is None:
            for axis in self.chartaxis_set.all():
                list_to_append = super()._get_objects_for_html(list_to_append, axis, ['chart'])

        return list_to_append


class D3Category(models.Model):
    label = models.CharField(max_length=400, default='', blank=True)
    link_type_choices = (
        (0, 'Variable'),
        (1, 'Category'),
        )
    links = models.PositiveSmallIntegerField(default=2, help_text="Linked variables or categories",
                                                       choices=link_type_choices)
    variables = models.ManyToManyField(Variable)
    categories = models.ManyToManyField(Category)

    chart = models.ForeignKey(D3Chart, on_delete=models.CASCADE)