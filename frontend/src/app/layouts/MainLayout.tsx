import { Outlet } from "react-router-dom";
import { Navbar } from "../../widgets/Navbar/ui/Navbar";

export const MainLayout = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
                <Outlet /> {/* Здесь будут рендериться наши страницы */}
            </main>
            {/* Здесь можно будет добавить Footer в будущем */}
        </div>
    );
};