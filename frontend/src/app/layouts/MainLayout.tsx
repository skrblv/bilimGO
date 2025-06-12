import { Outlet } from "react-router-dom";
import { Navbar } from "../../widgets/Navbar/ui/Navbar";

export const MainLayout = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
                {/* Здесь будут рендериться все дочерние страницы */}
                <Outlet /> 
            </main>
            {/* Сюда можно будет добавить глобальный футер */}
        </div>
    );
};