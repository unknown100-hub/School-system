import { NavLink } from "react-router-dom";
import financeMenu from "./financeMenu";

function FinanceSidebar() {
    return (
        <div className="sidebar">
            {financeMenu.map((item) => (
                <div key={item.title}>
                    {item.children ? (
                        <>
                            <h4>{item.title}</h4>
                            {item.children.map((child) => (
                                <NavLink key={child.title} to={child.path}>
                                    {child.title}
                                </NavLink>
                            ))}
                        </>
                    ) : (
                        <NavLink to={item.path}>{item.title}</NavLink>
                    )}
                </div>
            ))}
        </div>
    );
}

export default FinanceSidebar;