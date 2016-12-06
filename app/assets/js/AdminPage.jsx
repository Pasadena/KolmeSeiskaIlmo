import React from "react";

const AdminLayout = () => (
  <section>
      <h1>Browse admin sections</h1>
      <AdminSection name="Events" page="/admin/events"/>
      <AdminSection name="Cabins" page="/admin/cabins"/>
  </section>
);

const AdminSection = ({ page, name }) => {
  let navigate = () => window.location = page;
  return (
    <div className="admin-section" onClick={navigate}>
        {name}
    </div>
  );
}

export default AdminLayout;
