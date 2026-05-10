/**
 * Captures a DOM element and exports it as a professional PDF.
 * @param elementId The ID of the container element to capture.
 * @param auditId The unique ID for the filename.
 */
export async function exportAuditToPDF(elementId: string, auditId: string) {
  const element = document.getElementById(elementId);
  if (!element) return;

  // Add a temporary class for PDF-specific styling if needed
  element.classList.add("exporting-pdf");

  try {
    // Dynamically import to prevent SSR issues and ensure correct module resolution
    const html2canvas = (await import("html2canvas")).default;
    const { jsPDF } = await import("jspdf");

    // Wait for fonts to be ready
    await document.fonts.ready;

    const canvas = await html2canvas(element, {
      scale: 2, // Higher resolution
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
      allowTaint: true,
      onclone: (clonedDoc) => {
        const el = clonedDoc.getElementById(elementId);
        if (el) {
          el.style.padding = "40px";
          el.style.backgroundColor = "#ffffff";
          // Ensure specific elements are visible in PDF
          el.querySelectorAll(".bg-grid-pattern").forEach((node) => {
            (node as HTMLElement).style.opacity = "0.05";
          });
        }
      },
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: [canvas.width, canvas.height],
    });

    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
    pdf.save(`LedgerAI_Audit_${auditId}_${new Date().toISOString().split("T")[0]}.pdf`);
  } catch (error) {
    console.error("PDF Export failed:", error);
    alert("There was an issue generating the PDF. Please try again.");
  } finally {
    element.classList.remove("exporting-pdf");
  }
}
