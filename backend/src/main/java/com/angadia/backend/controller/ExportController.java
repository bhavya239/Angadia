package com.angadia.backend.controller;

import com.angadia.backend.service.ExportExcelService;
import com.angadia.backend.service.ExportPdfService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@Tag(name = "Exports", description = "Report exports (PDF, Excel)")
@RestController
@RequestMapping("/api/v1/export")
@RequiredArgsConstructor
public class ExportController {

    private final ExportPdfService exportPdfService;
    private final ExportExcelService exportExcelService;

    @Operation(summary = "Export Daily Register as PDF")
    @GetMapping("/daily-register/pdf")
    public ResponseEntity<byte[]> exportDailyRegisterPdf(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        try {
            byte[] pdfBytes = exportPdfService.generateDailyRegisterPdf(date);
            HttpHeaders headers = new HttpHeaders();
            headers.add("Content-Disposition", "attachment; filename=daily-register-" + date.toString() + ".pdf");
            headers.add("Content-Type", "application/pdf");
            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Operation(summary = "Export Daily Register as Excel")
    @GetMapping("/daily-register/excel")
    public ResponseEntity<byte[]> exportDailyRegisterExcel(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        try {
            byte[] excelBytes = exportExcelService.generateDailyRegisterExcel(date);
            HttpHeaders headers = new HttpHeaders();
            headers.add("Content-Disposition", "attachment; filename=daily-register-" + date.toString() + ".xlsx");
            headers.add("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            return new ResponseEntity<>(excelBytes, headers, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
