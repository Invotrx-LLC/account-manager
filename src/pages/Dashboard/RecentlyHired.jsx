import { Card, CardContent, Typography, Button } from "@mui/material";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";

const data = [
  { name: "Praful Krshetty", country: "USA", role: "Stats Programmer", salary: "₹74000", img: "https://randomuser.me/api/portraits/men/32.jpg" },
  { name: "Rohith Janeee", country: "UAE", role: "Stats Programmer", salary: "₹74000", img: "https://randomuser.me/api/portraits/men/44.jpg" },
  { name: "Rishabh Jain", country: "Germany", role: "Stats Programmer", salary: "₹74000", img: "https://randomuser.me/api/portraits/men/55.jpg" },
  { name: "Sai Karthik Kommu", country: "Belgium", role: "Stats Programmer", salary: "₹74000", img: "https://randomuser.me/api/portraits/women/68.jpg" },
  { name: "Dummy Data", country: "Greenland", role: "Stats Programmer", salary: "₹74000", img: "https://randomuser.me/api/portraits/men/76.jpg" },
];

export default function RecentlyHired() {
  return (
    <Card sx={{ borderRadius: 3, boxShadow: "0 1px 6px rgba(0,0,0,0.08)", height: "100%" }}>
      <CardContent sx={{ pt: 2, pb: 2 }}>

        {/* Header — native div for reliable flex */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              backgroundColor: "#FFF0E6",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <PeopleAltOutlinedIcon sx={{ fontSize: 18, color: "#FB923C" }} />
            </div>
            <span style={{ fontWeight: 700, fontSize: 15 }}>Latestly hired</span>
          </div>
          <button style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: 13, color: "#374151", textDecoration: "underline",
          }}>
            View All
          </button>
        </div>

        {/* List */}
        {data.map((item, i) => (
          <div key={i}>
            {/* Row — native flex */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0" }}>
              {/* Rounded photo */}
              <img
                src={item.img}
                alt={item.name}
                style={{ width: 46, height: 46, borderRadius: 10, objectFit: "cover", flexShrink: 0 }}
              />

              {/* Name + location */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {item.name}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 2, marginTop: 3 }}>
                  <LocationOnOutlinedIcon sx={{ fontSize: 13, color: "#9CA3AF" }} />
                  <span style={{ fontSize: 12, color: "#6B7280", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {item.country} • {item.role}
                  </span>
                </div>
              </div>

              {/* Salary */}
              <div style={{ fontWeight: 700, fontSize: 14, color: "#111827", whiteSpace: "nowrap" }}>
                {item.salary}
              </div>
            </div>

            {i < data.length - 1 && (
              <div style={{ height: 1, backgroundColor: "#F3F4F6" }} />
            )}
          </div>
        ))}

      </CardContent>
    </Card>
  );
}