import { ProjectGrid } from "@/components/dashboard/project-grid";
import { CreateProjectModal } from "@/components/dashboard/create-project-modal";

export const dynamic = "force-dynamic";

export default function ProjectsPage() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Proyectos</h1>
                    <p className="text-slate-400 mt-1">
                        Gestiona todos tus proyectos de QA
                    </p>
                </div>
                <CreateProjectModal />
            </div>

            {/* Projects Grid */}
            <ProjectGrid />
        </div>
    );
}
