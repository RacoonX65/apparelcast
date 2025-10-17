"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Ruler } from "lucide-react"

function Table({ headers, rows }: { headers: string[]; rows: (string | number)[][] }) {
  return (
    <div className="overflow-x-auto">
      <div className="min-w-full rounded-md border">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(100px,1fr))] bg-muted/50 text-xs font-medium">
          {headers.map((h, i) => (
            <div key={i} className="px-3 py-2">{h}</div>
          ))}
        </div>
        {rows.map((row, rIdx) => (
          <div key={rIdx} className="grid grid-cols-[repeat(auto-fit,minmax(100px,1fr))] text-sm">
            {row.map((cell, cIdx) => (
              <div key={cIdx} className="px-3 py-2 border-t">{cell}</div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function SizeGuide() {
  // South Africa: clothing in centimeters; shoes in UK sizes
  const menClothingHeaders = ["Size", "Chest (cm)", "Waist (cm)", "Hip (cm)"]
  const menClothingRows = [
    ["XS", "84–89", "70–75", "86–91"],
    ["S", "90–95", "76–81", "92–97"],
    ["M", "96–101", "82–87", "98–103"],
    ["L", "102–107", "88–93", "104–109"],
    ["XL", "108–113", "94–99", "110–115"],
    ["2XL", "114–119", "100–105", "116–121"],
  ]

  const womenClothingHeaders = ["Size", "Bust (cm)", "Waist (cm)", "Hip (cm)"]
  const womenClothingRows = [
    ["XS", "79–83", "63–67", "86–90"],
    ["S", "84–88", "68–72", "91–95"],
    ["M", "89–93", "73–77", "96–100"],
    ["L", "94–100", "78–84", "101–107"],
    ["XL", "101–107", "85–91", "108–114"],
    ["2XL", "108–114", "92–98", "115–121"],
  ]

  const menShoesHeaders = ["UK", "EU", "Foot length (cm)"]
  const menShoesRows = [
    ["5", "38", "24.5"],
    ["6", "39", "25.4"],
    ["7", "41", "26.2"],
    ["8", "42", "27.0"],
    ["9", "43", "27.9"],
    ["10", "44", "28.7"],
    ["11", "46", "29.6"],
    ["12", "47", "30.4"],
  ]

  const womenShoesHeaders = ["UK", "EU", "Foot length (cm)"]
  const womenShoesRows = [
    ["3", "36", "22.8"],
    ["4", "37", "23.6"],
    ["5", "38", "24.5"],
    ["6", "39", "25.4"],
    ["7", "40", "26.2"],
    ["8", "41", "27.0"],
  ]

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        South Africa sizing: all measurements are in centimeters. Shoes use UK sizes.
        Conversions are approximate and may vary by brand.
      </p>

      <Accordion type="multiple" className="w-full">
        <AccordionItem value="men-clothing">
          <AccordionTrigger>Men Clothing (cm)</AccordionTrigger>
          <AccordionContent>
            <Table headers={menClothingHeaders} rows={menClothingRows} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="women-clothing">
          <AccordionTrigger>Women Clothing (cm)</AccordionTrigger>
          <AccordionContent>
            <Table headers={womenClothingHeaders} rows={womenClothingRows} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="men-shoes">
          <AccordionTrigger>Shoes (Men – UK)</AccordionTrigger>
          <AccordionContent>
            <Table headers={menShoesHeaders} rows={menShoesRows} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="women-shoes">
          <AccordionTrigger>Shoes (Women – UK)</AccordionTrigger>
          <AccordionContent>
            <Table headers={womenShoesHeaders} rows={womenShoesRows} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

export function SizeGuideDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Ruler className="h-4 w-4" />
          Size Guide
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Size Guide (South Africa)</DialogTitle>
          <DialogDescription>All measurements in centimeters. Shoes use UK sizes.</DialogDescription>
        </DialogHeader>
        <SizeGuide />
      </DialogContent>
    </Dialog>
  )
}