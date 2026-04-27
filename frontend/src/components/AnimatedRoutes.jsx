import { Routes, Route, useLocation } from "react-router";

function renderRoutes(routes, parentKey = "route") {
  return routes.map(({ path, element, children }, index) => {
    const key = `${parentKey}-${path ?? "layout"}-${index}`;

    return (
      <Route key={key} path={path} element={element}>
        {Array.isArray(children) ? renderRoutes(children, key) : null}
      </Route>
    );
  });
}

function AnimatedRoutes({ routes }) {
  const location = useLocation();

  return (
    <div>
      <Routes location={location}>
        {renderRoutes(routes)}
      </Routes>
    </div>
  );
}

export default AnimatedRoutes;
