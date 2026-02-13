'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useBuilderStore } from '@/stores/builder-store';
import TemplatesTable from '@/components/tables/TemplatesTable';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import Toast from '@/components/ui/Toast';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useToast } from '@/hooks/useToast';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Template } from '@/types/blocks';

export default function TemplatesPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { loadTemplate } = useBuilderStore();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const { toast, showToast, hideToast } = useToast();

  // Fetch templates on mount
  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/templates');

      if (!response.ok) {
        throw new Error('Failed to fetch templates');
      }

      const data = await response.json();
      setTemplates(data);
    } catch (err) {
      console.error('Error fetching templates:', err);
      showToast(t.messages.templatesLoadFailed, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUseTemplate = async (id: string) => {
    const template = templates.find((t) => t.id === id);
    if (!template) return;

    // Load template into builder
    loadTemplate(id, template.name, template.blocks);

    // Navigate to builder
    router.push('/builder');
  };

  const handleRenameTemplate = async (id: string, newName: string) => {
    try {
      const response = await fetch(`/api/templates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
      });

      if (!response.ok) {
        throw new Error('Failed to rename template');
      }

      // Update local state
      setTemplates((prev) =>
        prev.map((t) => (t.id === id ? { ...t, name: newName } : t))
      );
      showToast(t.messages.templateRenamed, 'success');
    } catch (err) {
      console.error('Error renaming template:', err);
      showToast(t.messages.templateRenameFailed, 'error');
    }
  };

  const handleDeleteTemplate = (id: string) => {
    const template = templates.find((t) => t.id === id);
    if (!template) return;

    setDeleteConfirm({ id, name: template.name });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      const response = await fetch(`/api/templates/${deleteConfirm.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete template');
      }

      // Remove from local state
      setTemplates((prev) => prev.filter((t) => t.id !== deleteConfirm.id));
      showToast(t.messages.templateDeleted, 'success');
    } catch (err) {
      console.error('Error deleting template:', err);
      showToast(t.messages.templateDeleteFailed, 'error');
    } finally {
      setDeleteConfirm(null);
    }
  };

  if (loading) {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: 'clamp(28px, 6vw, 48px)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', margin: 0 }}>
            {t.dashboard.templates.title}
          </h1>
        </div>
        <LoadingSkeleton type="table" rows={5} />
      </div>
    );
  }

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

      {deleteConfirm && (
        <ConfirmDialog
          title={t.confirmDialog.deleteTemplate.title}
          message={t.confirmDialog.deleteTemplate.message.replace('{name}', deleteConfirm.name)}
          confirmText={t.confirmDialog.deleteTemplate.confirm}
          cancelText={t.confirmDialog.deleteTemplate.cancel}
          type="danger"
          onConfirm={confirmDelete}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: 'clamp(28px, 6vw, 48px)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', margin: 0 }}>
          {t.dashboard.templates.title}
        </h1>
      </div>

      <TemplatesTable
        templates={templates}
        onUse={handleUseTemplate}
        onRename={handleRenameTemplate}
        onDelete={handleDeleteTemplate}
      />
    </div>
  );
}
