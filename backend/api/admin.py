from django.contrib import admin
from .models import Project, UserProjects, Travel

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('name',)

@admin.register(UserProjects)
class UserProjectsAdmin(admin.ModelAdmin):
    list_display = ('user',)
    search_fields = ('user__username',)
    filter_horizontal = ('project',) 

@admin.register(Travel)
class TravelAdmin(admin.ModelAdmin):
    list_display = ('user', 'project', 'purpose', 'date', 'mode', 'start_location', 'end_location','status')
    list_filter = ('mode', 'date', 'project','status')
    search_fields = ('user__username', 'project__name', 'purpose', 'start_location', 'end_location','status')
    date_hierarchy = 'date'

