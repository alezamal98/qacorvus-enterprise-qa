import { KPICards } from "@/components/dashboard/kpi-cards";
import { ProjectGrid } from "@/components/dashboard/project-grid";
import { CreateProjectModal } from "@/components/dashboard/create-project-modal";

export default function DashboardPage() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                    <p className="text-slate-400 mt-1">
                        Bienvenido al panel de control de CORVUS QA Enterprise
                    </p>
                </div>
                <CreateProjectModal />
            </div>

            {/* KPI Cards */}
            <KPICards />

            {/* Projects Section */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-white">Proyectos</h2>
                <ProjectGrid />
            </div>
        </div>
    );
}
