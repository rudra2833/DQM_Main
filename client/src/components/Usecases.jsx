import React from "react";
import { Link } from "react-router-dom";
import Card from "react-bootstrap/Card";

const Usecases = () => {
  const documents = [
    { title: "Geospatial Data Correction Using Administrative Boundaries", url: "/usecases/lgdlatlong" },
    { title: "Geospartial Completeness Check", url: "/usecases/geoSpartialCommissionCheck" },
    // { title: "Something Else", url: "/usecases/somethingelse" },
  ];

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>

      {/* Dynamic Vertical Card */}
      <Card
        border="success"
        style={{
          width: "80%",
          margin: "0 auto",
          marginTop: "1.5rem",
          borderWidth: "0.1rem",
          borderRadius: "8px",
        }}
      >
        <Card.Header
          style={{
            backgroundColor: "#f8f9fa",
            textAlign: "center",
            fontWeight: "600",
            fontSize: "2.5rem",
          }}
        >
          Use-Cases
        </Card.Header>
        <Card.Body style={{ padding: "0" }}>
          {documents.map((doc, index) => (
            <div
              key={index}
              style={{
                padding: "1.5rem 3rem",
                borderBottom:
                  index !== documents.length - 1 ? "1px solid #dee2e6" : "none",
                textAlign: "left",
                fontSize: "1rem",
                fontWeight: "500",
              }}
            >
              <Link
                to={doc.url}
                style={{
                  textDecoration: "none",
                  color: "blue",
                }}
              >
                {doc.title}
              </Link>
            </div>
          ))}
        </Card.Body>
      </Card>
    </div>
  );
};

export default Usecases;