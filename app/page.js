"use client";

import { useState } from "react";

const inverters = [
  { brand: "Luminous", model: "HPV Hybrid", kva: 4, dcBus: 24, tubular: true, price: 500000 },
  { brand: "Luminous", model: "Neo Elite", kva: 6, dcBus: 51.2, tubular: true, price: 650000 },
  { brand: "Luminous", model: "Neo Elite", kva: 8, dcBus: 51.2, tubular: true, price: 800000 },
  { brand: "Talegent", model: "Xanadu-5048", kva: 7, dcBus: 51.2, tubular: true, price: 600000 },
  { brand: "KSTAR", model: "50kW", kva: 50, dcBus: 384, tubular: false, price: 5000000 },
  { brand: "Genus", model: "10kW", kva: 10, dcBus: 51.2, tubular: true, price: 1000000 }
];

const batteries = [
  { brand: "Luminous", type: "Lithium", model: "5kWh", kwh: 5.5, dcBus: 51.2, price: 1000000 },
  { brand: "Luminous", type: "Lithium", model: "10kWh", kwh: 11, dcBus: 51.2, price: 1300000 },
  { brand: "KSTAR", type: "Lithium", model: "107kWh", kwh: 107, dcBus: 384, price: 40000000 },

  { brand: "Luminous", type: "Tubular", model: "200AH", kwh: 1.92, dcBus: 12, price: 350000 },
  { brand: "Luminous", type: "Tubular", model: "220AH", kwh: 2.112, dcBus: 12, price: 380000 },

  { brand: "Genus", type: "Tubular", model: "220AH", kwh: 2.112, dcBus: 12, price: 350000 }
];

function money(value) {
  return "₦" + Math.round(value).toLocaleString();
}

export default function Home() {

  const [loadWatts, setLoadWatts] = useState(3000);
  const [backupHours, setBackupHours] = useState(6);
  const [batteryType, setBatteryType] = useState("Lithium");

  const requiredKwh = (loadWatts * backupHours) / 1000;
  const requiredKva = loadWatts / 1000;

  const suitableInverters = inverters.filter(inv => {

    if (inv.kva < requiredKva) {
      return false;
    }

    if (batteryType === "Tubular" && !inv.tubular) {
      return false;
    }

    return true;
  });

  const selectedInverter = suitableInverters[0];

  let selectedBattery = null;
  let batteryQty = 0;
  let seriesQty = 1;
  let parallelBanks = 1;
  let warning = "";

  if (selectedInverter) {

    const batteryOptions = batteries.filter(
      b => b.type === batteryType
    );

    if (batteryType === "Lithium") {

      selectedBattery = batteryOptions.find(
        b =>
          b.dcBus === selectedInverter.dcBus &&
          b.kwh >= requiredKwh
      );

      batteryQty = selectedBattery ? 1 : 0;
    }

    if (batteryType === "Tubular") {

      selectedBattery = batteryOptions[0];

      seriesQty = Math.ceil(selectedInverter.dcBus / 12);

      const bankCapacity =
        selectedBattery.kwh * seriesQty;

      parallelBanks = Math.ceil(
        requiredKwh / bankCapacity
      );

      if (parallelBanks > 3) {
        warning =
          "Maximum 3 parallel banks allowed for tubular battery.";
        parallelBanks = 3;
      }

      batteryQty = seriesQty * parallelBanks;
    }
  }

  const inverterCost =
    selectedInverter?.price || 0;

  const batteryCost =
    selectedBattery
      ? selectedBattery.price * batteryQty
      : 0;

  const totalCost =
    inverterCost + batteryCost;

  return (
    <main
      style={{
        maxWidth: 900,
        margin: "40px auto",
        padding: 20,
        fontFamily: "Arial"
      }}
    >

      <h1>Solar Solution Calculator</h1>

      <div
        style={{
          display: "grid",
          gap: 20,
          marginTop: 30
        }}
      >

        <div>
          <label>Total Load (Watts)</label>

          <input
            type="number"
            value={loadWatts}
            onChange={(e) =>
              setLoadWatts(Number(e.target.value))
            }
            style={{
              width: "100%",
              padding: 12,
              marginTop: 5
            }}
          />
        </div>

        <div>
          <label>Backup Hours</label>

          <input
            type="number"
            value={backupHours}
            onChange={(e) =>
              setBackupHours(Number(e.target.value))
            }
            style={{
              width: "100%",
              padding: 12,
              marginTop: 5
            }}
          />
        </div>

        <div>
          <label>Battery Type</label>

          <select
            value={batteryType}
            onChange={(e) =>
              setBatteryType(e.target.value)
            }
            style={{
              width: "100%",
              padding: 12,
              marginTop: 5
            }}
          >
            <option value="Lithium">
              Lithium
            </option>

            <option value="Tubular">
              Tubular
            </option>
          </select>
        </div>

      </div>

      <hr style={{ margin: "40px 0" }} />

      {selectedInverter ? (

        <div style={{ lineHeight: 2 }}>

          <h2>Calculation Result</h2>

          <p>
            <b>Required Load:</b>{" "}
            {requiredKva.toFixed(2)} KVA
          </p>

          <p>
            <b>Required Backup:</b>{" "}
            {requiredKwh.toFixed(2)} KWH
          </p>

          <p>
            <b>Selected Inverter:</b>{" "}
            {selectedInverter.brand}{" "}
            {selectedInverter.model}
          </p>

          <p>
            <b>Inverter Price:</b>{" "}
            {money(inverterCost)}
          </p>

          {selectedBattery && (
            <>
              <p>
                <b>Selected Battery:</b>{" "}
                {selectedBattery.brand}{" "}
                {selectedBattery.model}
              </p>

              <p>
                <b>Battery Quantity:</b>{" "}
                {batteryQty}
              </p>

              {batteryType === "Tubular" && (
                <>
                  <p>
                    <b>Series Batteries:</b>{" "}
                    {seriesQty}
                  </p>

                  <p>
                    <b>Parallel Banks:</b>{" "}
                    {parallelBanks}
                  </p>
                </>
              )}

              <p>
                <b>Battery Cost:</b>{" "}
                {money(batteryCost)}
              </p>
            </>
          )}

          <h2>
            Total Cost: {money(totalCost)}
          </h2>

          {warning && (
            <p style={{ color: "red" }}>
              {warning}
            </p>
          )}

        </div>

      ) : (

        <div>
          No suitable inverter found.
        </div>

      )}

    </main>
  );
}
