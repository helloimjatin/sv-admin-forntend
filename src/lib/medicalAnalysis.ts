import type { MedicalRecord } from "@/data/mockData";

export type Biomarker = { name: string; value: string; status: string; ref: string };

export function getMedicalAnalysis(record: MedicalRecord) {
  const type = (record.report_type || "").toLowerCase();
  const risk = (record.risk_level || "").toLowerCase();
  let biomarkers: Biomarker[] = [];
  let aiSummary = "";
  let recommendations: string[] = [];

  if (type.includes("blood") || type.includes("cbc")) {
    if (risk === "high") {
      biomarkers = [
        { name: "Hemoglobin", value: "9.2 g/dL", status: "Low", ref: "12.0 - 16.0 g/dL" },
        { name: "White Blood Cells", value: "7,800 /µL", status: "Normal", ref: "4,500 - 11,000 /µL" },
        { name: "Red Blood Cells", value: "3.8 M/µL", status: "Low", ref: "4.0 - 5.2 M/µL" },
        { name: "Platelet Count", value: "210,000 /µL", status: "Normal", ref: "150,000 - 450,000 /µL" },
      ];
      aiSummary = "Critical levels detected. The patient's Hemoglobin levels are significantly below normal thresholds, suggesting severe anemia or iron deficiency. Urgent clinical investigation is recommended.";
      recommendations = ["Schedule immediate follow-up with a Hematologist.", "Initiate iron supplementation protocol.", "Repeat CBC in 2 weeks.", "Evaluate dietary intake and GI absorption."];
    } else if (risk === "medium") {
      biomarkers = [
        { name: "Hemoglobin", value: "11.4 g/dL", status: "Low", ref: "12.0 - 16.0 g/dL" },
        { name: "White Blood Cells", value: "7,800 /µL", status: "Normal", ref: "4,500 - 11,000 /µL" },
        { name: "Red Blood Cells", value: "4.1 M/µL", status: "Normal", ref: "4.0 - 5.2 M/µL" },
        { name: "Platelet Count", value: "210,000 /µL", status: "Normal", ref: "150,000 - 450,000 /µL" },
      ];
      aiSummary = "Mild anemia patterns identified. Patient exhibits mildly lower hemoglobin counts. Other markers remain within baseline parameters.";
      recommendations = ["Monitor hemoglobin levels monthly.", "Consider dietary iron intake assessment.", "Repeat CBC in 4-6 weeks."];
    } else {
      biomarkers = [
        { name: "Hemoglobin", value: "14.2 g/dL", status: "Normal", ref: "12.0 - 16.0 g/dL" },
        { name: "White Blood Cells", value: "7,200 /µL", status: "Normal", ref: "4,500 - 11,000 /µL" },
        { name: "Red Blood Cells", value: "4.8 M/µL", status: "Normal", ref: "4.0 - 5.2 M/µL" },
        { name: "Platelet Count", value: "245,000 /µL", status: "Normal", ref: "150,000 - 450,000 /µL" },
      ];
      aiSummary = "All cellular and platelet parameters are within standard physiological ranges. No clinical abnormalities detected.";
      recommendations = ["Continue routine annual screening.", "Maintain balanced nutrition.", "No immediate clinical follow-up required."];
    }
  } else if (type.includes("lipid")) {
    if (risk === "high" || risk === "medium") {
      biomarkers = [
        { name: "Total Cholesterol", value: "245 mg/dL", status: "High", ref: "< 200 mg/dL" },
        { name: "LDL Cholesterol", value: "165 mg/dL", status: "High", ref: "< 100 mg/dL" },
        { name: "HDL Cholesterol", value: "38 mg/dL", status: "Low", ref: "> 40 mg/dL" },
        { name: "Triglycerides", value: "198 mg/dL", status: "High", ref: "< 150 mg/dL" },
      ];
      aiSummary = "Lipid panel indicates dyslipidemia with elevated LDL and total cholesterol. Cardiovascular risk assessment recommended.";
      recommendations = ["Initiate cardiology review.", "Implement low-fat dietary plan.", "Monitor blood pressure.", "Repeat lipid profile in 6 weeks."];
    } else {
      biomarkers = [
        { name: "Total Cholesterol", value: "180 mg/dL", status: "Normal", ref: "< 200 mg/dL" },
        { name: "LDL Cholesterol", value: "92 mg/dL", status: "Normal", ref: "< 100 mg/dL" },
        { name: "HDL Cholesterol", value: "48 mg/dL", status: "Normal", ref: "> 40 mg/dL" },
        { name: "Triglycerides", value: "130 mg/dL", status: "Normal", ref: "< 150 mg/dL" },
      ];
      aiSummary = "Cardiovascular lipid panel demonstrates normal and healthy ranges. LDL and triglycerides are within protective zones.";
      recommendations = ["Continue standard preventive care.", "Maintain active lifestyle.", "Annual lipid screening recommended."];
    }
  } else if (type.includes("liver")) {
    if (risk === "high") {
      biomarkers = [
        { name: "SGPT (ALT)", value: "89 U/L", status: "High", ref: "7 - 56 U/L" },
        { name: "SGOT (AST)", value: "72 U/L", status: "High", ref: "10 - 40 U/L" },
        { name: "Bilirubin Total", value: "1.8 mg/dL", status: "High", ref: "0.2 - 1.2 mg/dL" },
        { name: "Alkaline Phosphatase", value: "110 U/L", status: "Normal", ref: "44 - 147 U/L" },
      ];
      aiSummary = "Elevated hepatic enzymes detected indicating potential liver stress or damage. Clinical correlation and further hepatic workup advised.";
      recommendations = ["Urgent hepatology consultation.", "Review hepatotoxic medications.", "Abstain from alcohol.", "Repeat LFT in 2 weeks."];
    } else {
      biomarkers = [
        { name: "Bilirubin Total", value: "0.8 mg/dL", status: "Normal", ref: "0.2 - 1.2 mg/dL" },
        { name: "SGOT (AST)", value: "24 U/L", status: "Normal", ref: "10 - 40 U/L" },
        { name: "SGPT (ALT)", value: "30 U/L", status: "Normal", ref: "7 - 56 U/L" },
        { name: "Alkaline Phosphatase", value: "85 U/L", status: "Normal", ref: "44 - 147 U/L" },
      ];
      aiSummary = "Hepatic biomarkers show normal metabolic and clearance capacity. Liver performance is optimal.";
      recommendations = ["Continue routine monitoring.", "Maintain healthy lifestyle.", "Annual liver function screening."];
    }
  } else {
    if (risk === "high" || risk === "medium") {
      biomarkers = [
        { name: "Systolic BP", value: "142 mmHg", status: "High", ref: "90 - 120 mmHg" },
        { name: "Diastolic BP", value: "92 mmHg", status: "High", ref: "60 - 80 mmHg" },
        { name: "Blood Glucose (Fasting)", value: "118 mg/dL", status: "High", ref: "70 - 100 mg/dL" },
        { name: "Heart Rate", value: "72 bpm", status: "Normal", ref: "60 - 100 bpm" },
      ];
      aiSummary = "Vital signs indicate elevated cardiovascular and glycemic markers requiring lifestyle intervention and monitoring.";
      recommendations = ["Blood pressure monitoring twice daily.", "Low-sodium dietary modifications.", "Follow-up vitals in 2 weeks."];
    } else {
      biomarkers = [
        { name: "Systolic BP", value: "118 mmHg", status: "Normal", ref: "90 - 120 mmHg" },
        { name: "Diastolic BP", value: "76 mmHg", status: "Normal", ref: "60 - 80 mmHg" },
        { name: "Blood Glucose (Fasting)", value: "92 mg/dL", status: "Normal", ref: "70 - 100 mg/dL" },
        { name: "Heart Rate", value: "68 bpm", status: "Normal", ref: "60 - 100 bpm" },
      ];
      aiSummary = "All metabolic and hemodynamic vitals lie within established normal physiological baselines.";
      recommendations = ["Continue routine health maintenance.", "Annual wellness check recommended."];
    }
  }

  return { biomarkers, aiSummary, recommendations };
}
