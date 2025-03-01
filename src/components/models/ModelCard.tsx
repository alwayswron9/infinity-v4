import { Database, MoreHorizontal, FileText, Compass, Trash2, PlusCircle, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export interface ModelDefinition {
  id: string;
  name: string;
  description?: string;
  fields: Record<string, any>;
  status?: 'active' | 'archived';
  recordCount: number;
}

export interface ModelCardProps {
  model: ModelDefinition;
  onAddData: (modelId: string) => void;
  onArchiveToggle: (modelId: string, currentStatus: string) => void;
  onClearData: (modelId: string, modelName: string) => void;
  onDelete: (modelId: string) => void;
}

export function ModelCard({ 
  model, 
  onAddData, 
  onArchiveToggle, 
  onClearData, 
  onDelete 
}: ModelCardProps) {
  const isArchived = model.status === 'archived';
  
  return (
    <div className="model-card-modern">
      {/* Card Header with Model Name & Status */}
      <div className="model-card-header mb-3">
        <div className="flex items-start space-x-2">
          <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-md mt-0.5 bg-state-hover">
            <Database className="h-4 w-4 text-brand-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center">
              <h3 className="model-name truncate max-w-[150px] flex-shrink">{model.name}</h3>
              <span className={cn(
                "ml-2 inline-flex items-center px-2 py-0.5 text-xs rounded-full flex-shrink-0",
                isArchived 
                  ? "bg-surface-1 text-text-secondary" 
                  : "bg-status-success-subtle text-status-success"
              )}>
                <span className={cn(
                  "w-1.5 h-1.5 rounded-full mr-1.5",
                  isArchived ? "bg-text-secondary" : "bg-status-success"
                )}></span>
                {isArchived ? 'Archived' : 'Active'}
              </span>
            </div>
            <div className="w-full overflow-hidden">
              <div className="max-w-full">
                <p className="model-description" title={model.description || 'No description'}>
                  {model.description || 'No description'}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0 text-text-secondary">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[180px]">
            <DropdownMenuItem
              onClick={() => onAddData(model.id)}
              disabled={isArchived}
              className={cn(
                "text-sm cursor-pointer hover:bg-surface-2",
                isArchived ? "opacity-50 cursor-not-allowed" : ""
              )}
            >
              <FileText className="h-4 w-4 mr-2" />
              Add Data
            </DropdownMenuItem>
            
            <Link href={`/models/${model.id}/explore`} className="w-full">
              <DropdownMenuItem disabled={isArchived} className="text-sm cursor-pointer hover:bg-surface-2">
                <Compass className="h-4 w-4 mr-2" />
                Explore Data
              </DropdownMenuItem>
            </Link>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem
              onClick={() => onArchiveToggle(model.id, model.status || 'active')}
              className="text-sm cursor-pointer hover:bg-surface-2"
            >
              {isArchived ? 'Restore' : 'Archive'}
            </DropdownMenuItem>
            
            <DropdownMenuItem
              onClick={() => onClearData(model.id, model.name)}
              disabled={isArchived}
              className="text-sm cursor-pointer text-status-warning hover:bg-surface-2"
            >
              Clear All Data
            </DropdownMenuItem>
            
            <DropdownMenuItem
              onClick={() => onDelete(model.id)}
              className="text-sm cursor-pointer text-status-error hover:bg-surface-2"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Model
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* Card Stats */}
      <div className="rounded-md p-3 mb-3 bg-surface-2">
        <div className="grid grid-cols-2 gap-4">
          <div className="stats-item">
            <div className="stats-label">Fields</div>
            <div className="stats-value text-sm">{Object.keys(model.fields).length}</div>
          </div>
          
          <div className="stats-item">
            <div className="stats-label">Records</div>
            <div className="stats-value text-sm">{model.recordCount}</div>
          </div>
        </div>
      </div>
      
      {/* Card Actions - Changed from flex-col to flex-row */}
      <div className="flex flex-row gap-2 mt-auto pt-4 border-t border-border-primary">
        <Button
          variant="tertiary"
          size="sm"
          onClick={() => onAddData(model.id)}
          disabled={isArchived}
          className="text-xs h-8 px-3 flex-1 justify-center"
        >
          <PlusCircle className="h-3.5 w-3.5 mr-1.5" />
          Add Data
        </Button>
        
        <Link href={`/models/${model.id}/explore`} className="flex-1">
          <Button
            variant="secondary"
            size="sm"
            disabled={isArchived}
            className="text-xs h-8 px-3 w-full justify-center"
          >
            <ArrowUpRight className="h-3.5 w-3.5 mr-1.5" />
            Explore
          </Button>
        </Link>
      </div>
    </div>
  );
} 