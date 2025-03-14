"use client";
import * as React from "react";
import { useState, useMemo, useCallback } from "react";
import { Document, Page as PdfPage } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import Slider from "react-slick";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import { Plus as PlusIcon } from "@phosphor-icons/react/dist/ssr/Plus";
import { CompaniesFilters } from "@/components/dashboard/integrations/integrations-filters";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { GlobalWorkerOptions } from "pdfjs-dist";
GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.mjs";

export default function ReglamentoPage(): React.JSX.Element {
  const [pdfData, setPdfData] = useState<Uint8Array | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (file.type !== "application/pdf") {
      setError("El archivo seleccionado no es un PDF.");
      return;
    }

    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = () => {
      if (reader.result) {
        setPdfData(new Uint8Array(reader.result as ArrayBuffer));
        setNumPages(0);
        setError(null);
      } else {
        setError("Error: El archivo está vacío o no se pudo leer.");
      }
    };
    reader.onerror = () => {
      setError("Error al cargar el archivo PDF.");
      console.error(reader.error);
    };
  }, []);
  
  const memoizedPdfFile = useMemo(() => (pdfData ? { data: pdfData } : null), [pdfData]);

  const settings = {
    dots: true,
    infinite: true,
    speed: 300,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: "1 1 auto" }}>
          <Typography variant="h4">Reglamento</Typography>
        </Stack>
        <div>
          <Button
            component="label"
            startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />}
            variant="contained"
          >
            Cargar Reglamento
            <input
              type="file"
              accept="application/pdf"
              hidden
              onChange={handleFileUpload}
              aria-label="Cargar archivo PDF"
            />
          </Button>
        </div>
      </Stack>
      <CompaniesFilters />
      {error && (
        <Typography color="error" sx={{ textAlign: "center" }}>
          {error}
        </Typography>
      )}
      {memoizedPdfFile && (
        <Card sx={{ p: 2, textAlign: "center" }}>
          <Document
            file={memoizedPdfFile}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            onLoadError={() => setError("No se pudo cargar el archivo PDF.")}
          >
            {numPages > 0 ? (
              <Slider {...settings}>
                {Array.from({ length: numPages }, (_, index) => (
                  <PdfPage key={index} pageNumber={index + 1} width={600} />
                ))}
              </Slider>
            ) : (
              <Typography>Cargando páginas...</Typography>
            )}
          </Document>
        </Card>
      )}
    </Stack>
  );
}