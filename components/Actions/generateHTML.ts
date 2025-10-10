import {
  Employee,
  Establishment,
  Period,
  ViolationValues,
} from "@/types/globals";
import {
  calculate,
  formatDate,
  formatNumber,
  getDaysOrHours,
  getMinimumRate,
  getTotal,
  getViolationKeyword,
  numberToLetter,
  validate,
  wageOrders,
} from "@/utils/globals";

const getStyles = (isPreview: boolean) => {
  return `
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 1.25rem;
          padding: 0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 1.25rem;
        }
        th, td {
          padding: 0 0.375rem;
          font-size: ${isPreview ? "2" : "0.75"}rem;
        }
        h1 {
          text-align: center; 
          font-size: ${isPreview ? "2.5" : "1.25"}rem;
          font-weight: bold;
          color: black;
          margin-bottom: 1.25rem;
        }
        p {
          margin: 0;
          padding: 0;
        }
        .bold {
          font-weight: bold;
          text-decoration: underline;
        }
        .right {
          text-align: right;
        }
        .space {
          font-size: 0.5rem;
        }
        .top-space {
            margin-top: 1rem;
        }
      </style>
    `;
};

const generateHTML = (record: Establishment, isPreview: boolean) => {
  const renderEmployee = (employee: Employee, index: number) => {
    let html = "";

    if (employee.violations && employee.violations.length > 0) {
      const violations = JSON.parse(employee.violations[0].values as string);

      let valid = 0;
      Object.values(violations as ViolationValues).forEach((violationType) => {
        violationType.periods.forEach((period) => {
          validate(period) && (valid += 1);
        });
      });

      if (valid > 0) {
        html += `        
          <tr>
              <td>
                <p>
                  ${index + 1}. 
                  ${employee.last_name.toUpperCase()}, 
                  ${employee.first_name.toUpperCase()} 
                  ${["NA", "N/A"].includes(employee.middle_initial.toUpperCase()) ? "" : ` ${employee.middle_initial.toUpperCase()}.`}
                </p>
                
                <p>Actual Rate: Php${formatNumber(employee.rate)}/day</p>
              </td>
          </tr>
          <tr><td>${renderViolations(employee)}</td></tr>
        `;
      }
    }

    return html;
  };

  const renderViolations = (employee: Employee) => {
    let html = "";

    if (employee.violations && employee.violations.length > 0) {
      const violations = JSON.parse(employee.violations[0].values as string);

      let total = 0;
      Object.keys(violations).forEach((type) => {
        const violationType = violations[type];
        total += getTotal(violationType, type, record.size);

        let valid = 0;
        violationType.periods.forEach((period: Period) => {
          if (validate(period)) {
            valid += 1;
          }
        });

        if (valid > 0) {
          html += `
          <p class="bold top-space">
            ${
              type == "Holiday Pay" ? "Non-payment" : "Underpayment"
            } of ${getViolationKeyword(type)}
          </p>
         
          ${renderViolationType(violations[type], type)}
        `;
        }
      });

      html += `<p class="bold right">Total: Php${formatNumber(total)}</p>`;
    }

    return html;
  };

  const renderViolationType = (
    violationType: { periods: Period[]; received?: string },
    type: string,
  ) => {
    let html = "";
    let subtotal = 0;

    violationType.periods.forEach((period, index) => {
      const result = calculate(period, type, record.size);
      if (validate(period)) {
        subtotal += result;
        html += `
        <p>Period${
          violationType.periods.length > 1 ? ` ${numberToLetter(index)}` : ""
        }: ${formatDate(period.start_date)} to ${formatDate(
          period.end_date,
        )} (${getDaysOrHours(type, period.daysOrHours)})
        </p>

        ${renderFormula(period, type)}

        ${
          index + 1 != violationType.periods.length
            ? `<p class="space">&nbsp</p>`
            : ""
        }`;
      }
    });

    if (violationType.periods.length > 1) {
      html += `
        <p class="right">
          Subtotal: Php${formatNumber(subtotal)}
        </p>
      `;
    }

    if (type == "13th Month Pay") {
      html += `
      <p>
        Actual 13th Month Pay Received: 
        Php${formatNumber(violationType.received || 0)}
      </p>

      <p>
        Php${formatNumber(subtotal)} - ${formatNumber(
          violationType.received || 0,
        )} 
        <span>= Php${formatNumber(
          subtotal - (Number(violationType.received) || 0),
        )}</span>
      </p>
      `;
    }

    return html;
  };

  const renderFormula = (period: Period, type: string) => {
    let html = "";

    const rate = Number(period.rate);
    const minimumRate = getMinimumRate(
      period.start_date,
      period.end_date,
      record.size,
    );

    const wageOrder = wageOrders.find((wageOrder) => {
      const key =
        record.size == "Employing 10 or more workers"
          ? "tenOrMore"
          : "lessThanTen";
      return wageOrder.rates[key] == minimumRate;
    });

    if (minimumRate >= rate) {
      html += `
        <p>
          Prevailing Rate: Php${formatNumber(minimumRate)} (${wageOrder!.name})
        </p>`;
    }

    const formattedRateToUse = formatNumber(Math.max(rate, minimumRate));
    const total = formatNumber(calculate(period, type, record.size));
    const keyword = getDaysOrHours(type, period.daysOrHours);

    switch (type) {
      case "Basic Wage":
        html += `<p>
                  Php${formatNumber(minimumRate)} - ${formatNumber(rate)} x ${keyword} 
                  <span class="value">= Php${total}</span>
                 </p>`;
        break;
      case "Overtime Pay":
        html += `<p>
                  Php${formattedRateToUse} / 8 x ${period.type == "Normal Day" ? "25" : "30"}% x ${keyword} 
                  <span class="value">= Php${total}</span>
                 </p>`;
        break;
      case "Night Shift Differential":
        html += `<p>Php${formattedRateToUse} / 8 x 10% x ${keyword} <span class="value">= Php${total}</span></p>`;
        break;
      case "Special Day":
        html += `<p>
                    Php${formattedRateToUse} x 30% x ${keyword} <span class="value">= Php${total}</span>
                 </p>`;
        break;
      case "Rest Day":
        html += `<p>Php${formattedRateToUse} x 30% x ${keyword} <span class="value">= Php${total}</span></p>`;
        break;
      case "Holiday Pay":
        html += `<p>Php${formattedRateToUse} x ${keyword} <span class="value">= Php${total}</span></p>`;
        break;
      case "13th Month Pay":
        html += `<p>Php${formattedRateToUse} x ${keyword} / 12 months = Php${total}</p>`;
        break;
      default:
        html += "";
        break;
    }

    return html;
  };

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>PDF Preview</title>
        ${getStyles(isPreview)}
      </head>
      <body>
        ${
          record &&
          `<h1>${record.name.toUpperCase()}</h1>

          <table>
            <tbody>
              ${
                record &&
                record.employees &&
                record.employees
                  .map(
                    (employee, index) => `
                  ${renderEmployee(employee, index)}
                `,
                  )
                  .join("")
              }
            </tbody>
          </table>
          `
        }
      </body>
    </html>
  `;
};

export default generateHTML;
