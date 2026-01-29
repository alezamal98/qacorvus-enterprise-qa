import { KPICards } from "@/components/dashboard/kpi-cards";
import { ProjectGrid } from "@/components/dashboard/project-grid";
import { CreateProjectModal } from "@/components/dashboard/create-project-modal";
import { RecentBugs } from "@/components/dashboard/recent-bugs";
import { ChartsContainer } from "@/components/dashboard/analytics/charts-container";

export const dynamic = "force-dynamic";

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
                <div className="flex items-center gap-4">
                    <img
                        src="/dashboard-banner.jpg"
                        alt="Team Member"
                        className="h-16 w-auto rounded-xl object-cover hidden md:block"
                    />
                    <CreateProjectModal />
                </div>
            </div>

            {/* KPI Cards */}
            <KPICards />

            {/* Analytics Charts */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-white">Analíticas</h2>
                <ChartsContainer />
            </div>

            {/* Dashboard Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Projects Section (Main column) */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-xl font-semibold text-white">Proyectos</h2>
                    <ProjectGrid />
                </div>

                {/* Sidebar Column */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-white">Actividad</h2>
                    <RecentBugs />
                </div>
            </div>
        </div>
    );
}
