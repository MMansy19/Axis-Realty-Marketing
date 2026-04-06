'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ProjectForm from '@/components/admin/ProjectForm';
import type { FinishingProject } from '@/lib/types/project';

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [project, setProject] = useState<FinishingProject | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProject() {
      try {
        const res = await fetch(`/api/finishing-projects/${id}`);
        if (res.status === 401) {
          router.push('/admin/login');
          return;
        }
        if (!res.ok) {
          router.push('/admin/dashboard?tab=projects');
          return;
        }
        const data = await res.json();
        setProject(data);
      } catch {
        router.push('/admin/dashboard?tab=projects');
      } finally {
        setLoading(false);
      }
    }
    fetchProject();
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[#9AA0A6]">Loading...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[#9AA0A6]">Project not found</p>
      </div>
    );
  }

  return <ProjectForm project={project} />;
}
