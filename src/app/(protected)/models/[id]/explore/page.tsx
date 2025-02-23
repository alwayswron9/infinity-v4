'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PlusIcon, Loader2Icon, ArrowLeftIcon, SearchIcon, TrashIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { use } from 'react';
import { ModelDefinition } from '@/types/modelDefinition';
import { DataRecord } from '@/types/dataRecord';
import { DataTable } from '@/components/data/DataTable';
import { PaginationControls } from '@/components/data/PaginationControls';
import { RecordForm } from '@/components/data/RecordForm';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Section } from '@/components/layout/Section';
import { Button } from '@/components/ui/button';

export default function ExploreModelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [model, setModel] = useState<ModelDefinition | null>(null);
  const [records, setRecords] = useState<DataRecord[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DataRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [filterValues, setFilterValues] = useState({});

  useEffect(() => {
    fetchModel();
  }, [id]);

  useEffect(() => {
    if (model) {
      fetchRecords();
    }
  }, [model, page, pageSize, id]);

  const fetchModel = async () => {
    try {
      const response = await fetch(`/api/models?id=${id}`, {
        credentials: 'same-origin'
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to fetch model');
      }
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to fetch model');
      }
      setModel(data.data);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
      router.push('/models');
    }
  };

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/data/${id}?page=${page}&limit=${pageSize}`,
        { credentials: 'same-origin' }
      );
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to fetch records');
      }
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to fetch records');
      }
      setRecords(data.data);
      setTotalRecords(data.meta.total);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRecord = async (fields: Record<string, any>) => {
    try {
      const response = await fetch(`/api/data/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ fields }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to create record');
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to create record');
      }

      toast.success('Record created successfully');
      setShowForm(false);
      fetchRecords();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleUpdateRecord = async (fields: Record<string, any>) => {
    if (!editingRecord) return;

    try {
      const response = await fetch(
        `/api/data/${id}?id=${editingRecord._id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({ fields }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to update record');
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to update record');
      }

      toast.success('Record updated successfully');
      setEditingRecord(null);
      fetchRecords();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDeleteRecord = async (record: DataRecord) => {
    if (!confirm('Are you sure you want to delete this record?')) return;

    try {
      const response = await fetch(
        `/api/data/${id}?id=${record._id}`,
        { 
          method: 'DELETE',
          credentials: 'same-origin'
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to delete record');
      }

      toast.success('Record deleted successfully');
      fetchRecords();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleClearData = async () => {
    if (!confirm('Are you sure you want to delete ALL records? This action cannot be undone.')) return;

    try {
      const response = await fetch(
        `/api/data/${id}/clear`,
        { 
          method: 'POST',
          credentials: 'same-origin'
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to clear data');
      }

      toast.success('All records deleted successfully');
      fetchRecords();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || !model?.embedding?.enabled) return;

    try {
      setIsSearching(true);
      
      // Build filter from current filter state
      const filter = Object.entries(filterValues)
        .filter(([_, value]) => value !== undefined && value !== '')
        .reduce((acc, [key, value]) => ({
          ...acc,
          [key]: value
        }), {});

      const response = await fetch(`/api/data/${id}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          query: searchQuery,
          limit: pageSize,
          minSimilarity: 0.7,
          filter: Object.keys(filter).length > 0 ? filter : undefined
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to perform search');
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to perform search');
      }

      // Update records with search results
      setRecords(data.data);
      setTotalRecords(data.data.length);
      setPage(1); // Reset to first page when searching
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    fetchRecords(); // Reset to normal record view
  };

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 text-red-500 p-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  if (!model) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2Icon className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title={model?.name || 'Loading...'}
        description={model?.description}
        backHref="/models"
        actions={
          <div className="flex gap-3">
            <Button 
              onClick={handleClearData}
              variant="outline"
              className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
            >
              <TrashIcon className="w-5 h-5 mr-2" />
              Clear Data
            </Button>
            <Button 
              onClick={() => setShowForm(true)}
              className="bg-primary text-white hover:bg-primary/90"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Add Record
            </Button>
          </div>
        }
      />

      {showForm || editingRecord ? (
        <Section
          title={editingRecord ? 'Edit Record' : 'New Record'}
        >
          <RecordForm
            model={model}
            initialData={editingRecord || undefined}
            onSubmit={editingRecord ? handleUpdateRecord : handleCreateRecord}
            onCancel={() => {
              setShowForm(false);
              setEditingRecord(null);
            }}
          />
        </Section>
      ) : (
        <Section>
          <div className="flex justify-between items-center mb-6">
            {model?.embedding?.enabled && (
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Search similar records..."
                    className="w-full px-4 py-2 pr-10 border border-border/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <button
                    onClick={handleSearch}
                    disabled={isSearching || !searchQuery.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-text-secondary hover:text-primary disabled:opacity-50"
                  >
                    {isSearching ? (
                      <Loader2Icon className="w-5 h-5 animate-spin" />
                    ) : (
                      <SearchIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="mt-2 text-sm text-text-secondary hover:text-primary"
                  >
                    Clear search
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-border/40">
            <DataTable
              model={model}
              records={records}
              onEdit={setEditingRecord}
              onDelete={handleDeleteRecord}
            />
            <PaginationControls
              currentPage={page}
              totalPages={Math.ceil(totalRecords / pageSize)}
              pageSize={pageSize}
              totalRecords={totalRecords}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          </div>
        </Section>
      )}
    </PageContainer>
  );
} 