'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, Loader2Icon, DatabaseIcon, SearchIcon, LinkIcon, ChevronRightIcon, PencilIcon, CompassIcon, TrashIcon, MoreVerticalIcon, ArchiveIcon } from 'lucide-react';
import { ModelDefinition } from '@/types/modelDefinition';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Section } from '@/components/layout/Section';

export default function ModelsPage() {
  const [models, setModels] = useState<ModelDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      console.log('Making fetch request to /api/models');
      const response = await fetch('/api/models', {
        credentials: 'same-origin'
      });
      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to fetch models:', errorData);
        throw new Error(errorData.error?.message || 'Failed to fetch models');
      }

      const data = await response.json();
      console.log('Received models:', data);

      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to fetch models');
      }

      setModels(data.data);
    } catch (err: any) {
      const message = err.message || 'Error loading models';
      setError(message);
      toast.error(message);
      console.error('Error in fetchModels:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (modelId: string) => {
    if (!confirm('Are you sure you want to delete this model? This action cannot be undone.')) return;

    try {
      const response = await fetch(`/api/models?id=${modelId}`, {
        method: 'DELETE',
        credentials: 'same-origin'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to delete model');
      }

      toast.success('Model deleted successfully');
      fetchModels();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2Icon className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 text-red-500 p-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <PageContainer maxWidth="6xl">
      <PageHeader 
        title="Models"
        description="Create and manage your data models"
        actions={
          <Button className="bg-primary text-white hover:bg-primary/90" asChild>
            <Link href="/models/new">
              <PlusIcon className="mr-2 h-4 w-4" />
              New Model
            </Link>
          </Button>
        }
      />

      <Section>
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Search models..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="show-archived" className="text-sm font-medium">
              Show Archived
            </Label>
            <Switch
              id="show-archived"
              checked={showArchived}
              onCheckedChange={setShowArchived}
            />
          </div>
        </div>

        {models.length === 0 ? (
          <div className="flex flex-col items-center gap-4 p-12 text-center">
            <DatabaseIcon className="h-12 w-12 text-muted-foreground" />
            <h3 className="text-xl font-semibold">No models defined yet</h3>
            <p className="text-sm text-muted-foreground">
              Create your first data model to get started
            </p>
            <Button className="bg-primary text-white hover:bg-primary/90">
              <PlusIcon className="mr-2 h-4 w-4" />
              Create Model
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {models
              .filter(model => showArchived || (model.status || 'active') === 'active')
              .map((model) => (
                <div
                  key={model.id}
                  className={cn(
                    'group p-4 border-b last:border-b-0 hover:bg-surface-hover transition-colors',
                    model.status === 'archived' && 'opacity-70'
                  )}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <DatabaseIcon className="w-4 h-4 text-muted-foreground" />
                        <h3 className="font-semibold text-text">{model.name}</h3>
                        {model.status === 'archived' && (
                          <Badge variant="outline" className="text-xs py-1 px-2">
                            Archived
                          </Badge>
                        )}
                      </div>
                      
                      {model.description && (
                        <p className="text-sm text-muted-foreground">
                          {model.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{Object.keys(model.fields).length} fields</span>
                        {model.embedding?.enabled && (
                          <span className="flex items-center gap-1 text-success">
                            <SearchIcon className="w-3.5 h-3.5" />
                            Vector Search
                          </span>
                        )}
                        {model.relationships && Object.keys(model.relationships).length > 0 && (
                          <span className="flex items-center gap-1">
                            <LinkIcon className="w-3.5 h-3.5" />
                            {Object.keys(model.relationships).length} relationships
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {model.status === 'active' && (
                        <Button
                          variant="tertiary"
                          size="sm"
                          className="group transition-all hover:scale-[1.02]"
                          asChild
                        >
                          <Link href={`/models/${model.id}/explore`}>
                            <CompassIcon className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
                            <span>Explore</span>
                          </Link>
                        </Button>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVerticalIcon className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            asChild
                            className="focus:bg-accent/10"
                          >
                            <Link href={`/models/${model.id}`}>
                              <PencilIcon className="mr-2 h-4 w-4" />
                              <span>Edit</span>
                            </Link>
                          </DropdownMenuItem>
                          
                          {model.status === 'active' ? (
                            <DropdownMenuItem
                              onClick={async () => {
                                try {
                                  const response = await fetch(`/api/models/${model.id}/archive`, {
                                    method: 'POST',
                                    credentials: 'same-origin'
                                  });
                                  if (!response.ok) throw new Error('Failed to archive model');
                                  toast.success('Model archived successfully');
                                  fetchModels();
                                } catch (error: any) {
                                  toast.error(error.message);
                                }
                              }}
                              className="text-warning focus:bg-warning/10"
                            >
                              <ArchiveIcon className="mr-2 h-4 w-4" />
                              <span>Archive</span>
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={async () => {
                                try {
                                  const response = await fetch(`/api/models/${model.id}/restore`, {
                                    method: 'POST',
                                    credentials: 'same-origin'
                                  });
                                  if (!response.ok) throw new Error('Failed to restore model');
                                  toast.success('Model restored successfully');
                                  fetchModels();
                                } catch (error: any) {
                                  toast.error(error.message);
                                }
                              }}
                              className="text-success focus:bg-success/10"
                            >
                              <ArchiveIcon className="mr-2 h-4 rotate-180" />
                              <span>Restore</span>
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </Section>
    </PageContainer>
  );
} 