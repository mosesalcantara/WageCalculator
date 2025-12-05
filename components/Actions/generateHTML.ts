import {
  Employee,
  Establishment,
  Period,
  ViolationKey,
  ViolationType,
  WageOrder,
} from "@/types/globals";
import {
  calculate,
  formatDate,
  formatNumber,
  getMinimumRate,
  getTotal,
  getValueKeyword,
  getViolationKeyword,
  isHours,
  numberToLetter,
  parseNumber,
  validate,
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
              }
              .underline {
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

const generateHTML = (
  wageOrders: WageOrder[],
  establishment: Establishment,
  isPreview: boolean,
) => {
  const renderEmployee = (index: number, employee: Employee) => {
    let html = "";

    if (employee.violations && employee.violations.length > 0) {
      const violations: Record<ViolationKey, ViolationType> = JSON.parse(
        employee.violations[0].values as string,
      );

      let valid = 0;
      Object.keys(violations).forEach((key) => {
        const type = key as ViolationKey;
        violations[type].periods.forEach((period) => {
          if (validate(period, isHours(type) ? [] : ["hours"])) ++valid;
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
                          ${["na", "n/a"].includes(employee.middle_initial.toLowerCase()) ? "" : ` ${employee.middle_initial.toUpperCase()}.`}
                        </p>
                        
                        <p>Actual Rate: Php${formatNumber(employee.rate)}/day</p>
                      </td>
                  </tr>

                  <tr>
                    <td>${renderViolations(employee)}</td>
                  </tr>
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
      Object.keys(violations).forEach((key) => {
        const type = key as ViolationKey;
        const violationType = violations[type];
        total += getTotal(wageOrders, type, establishment.size, violationType);

        let valid = 0;
        violationType.periods.forEach((period: Period) => {
          if (validate(period, isHours(type) ? [] : ["hours"])) ++valid;
        });

        if (valid > 0) {
          html += `
                    <p class="bold underline top-space">
                      ${
                        !violationType.received ||
                        violationType.received === "0"
                          ? "Non-payment"
                          : "Underpayment"
                      } of ${getViolationKeyword(type)}
                    </p>
                  
                    ${renderViolationType(type, violations[type])}
                  `;
        }
      });

      html += `
                <p class="bold right">Total: Php${formatNumber(total)}</p>
                <p class="space">&nbsp</p>
              `;
    }

    return html;
  };

  const renderViolationType = (
    type: ViolationKey,
    violationType: { periods: Period[]; received: string },
  ) => {
    let html = "";
    let subtotal = 0;
    const received = parseNumber(violationType.received);

    violationType.periods.forEach((period, index) => {
      const result = calculate(wageOrders, type, establishment.size, period);

      if (validate(period, isHours(type) ? [] : ["hours"])) {
        subtotal += result;

        const value = isHours(type)
          ? `${parseNumber(period.days) * parseNumber(period.hours)}`
          : `${period.days}`;

        html += `
                  <p>Period${
                    violationType.periods.length > 1
                      ? ` ${numberToLetter(index)}`
                      : ""
                  }: ${formatDate(period.start_date, "dd MMMM yyyy")} to ${formatDate(
                    period.end_date,
                    "dd MMMM yyyy",
                  )} (${value} ${getValueKeyword(type, period.days, period.hours)})
                  </p>

                  ${renderFormula(type, period)}

                  ${
                    index + 1 !== violationType.periods.length ||
                    (index + 1 === violationType.periods.length && received > 0)
                      ? `<p class="space">&nbsp</p>`
                      : ""
                  }
                `;
      }
    });

    if (received > 0) {
      html += `
                <p>
                  Actual Pay Received: 
                  Php${formatNumber(received)}
                </p>

                <p>
                  Php${formatNumber(subtotal)} - ${formatNumber(received)} 
                  <span>= Php${formatNumber(subtotal - received)}</span>
                </p>
              `;
    }

    if (violationType.periods.length > 1) {
      html += `
                <p class="right">Subtotal: Php${formatNumber(subtotal - received)}</p>
              `;
    }

    return html;
  };

  const renderFormula = (type: ViolationKey, period: Period) => {
    let html = "";

    const rate = parseNumber(period.rate);
    const minimumRate = getMinimumRate(
      wageOrders,
      establishment.size,
      period.start_date,
      period.end_date,
    );

    const wageOrder = wageOrders.find((wageOrder) => {
      const key =
        establishment.size === "Employing 10 or more workers"
          ? "ten_or_more"
          : "less_than_ten";
      return wageOrder[key] === minimumRate;
    });

    if (wageOrder) {
      html += `
                <p>Prevailing Rate: Php${formatNumber(minimumRate)} (${wageOrder.name})</p>
              `;
    }

    const formattedRateToUse = formatNumber(Math.max(rate, minimumRate));
    const total = formatNumber(
      calculate(wageOrders, type, establishment.size, period),
    );
    const keyword = getValueKeyword(type, period.days, period.hours);

    switch (type) {
      case "Basic Wage":
        html += `
                  <p>
                    Php${formatNumber(minimumRate)} - ${formatNumber(rate)} x ${period.days} ${keyword} 
                    <span class="value">= Php${total}</span>
                  </p>
                `;
        break;
      case "Overtime Pay":
        html += `
                  <p>
                    Php${formattedRateToUse} / 8 x ${period.type === "Normal Day" ? "125" : "130"}% x ${period.days} day${parseNumber(period.days) === 1 ? "" : "s"} x ${period.hours} ${keyword} 
                    <span class="value">= Php${total}</span>
                  </p>
                `;
        break;
      case "Night Shift Differential":
        html += `
                  <p>
                    Php${formattedRateToUse} / 8 x 10% x ${period.days} x ${period.hours} ${keyword} 
                    <span class="value">= Php${total}</span>
                  </p>
                `;
        break;
      case "Special Day":
        html += `
                  <p>
                    Php${formattedRateToUse} x 30% x ${period.days} ${keyword} 
                    <span class="value">= Php${total}</span>
                  </p>
                `;
        break;
      case "Rest Day":
        html += `
                  <p>
                    Php${formattedRateToUse} x 30% x ${period.days} ${keyword} 
                    <span class="value">= Php${total}</span>
                  </p>
                `;
        break;
      case "Holiday Pay":
        html += `
                  <p>
                    Php${formattedRateToUse} x ${period.days} ${keyword} 
                    <span class="value">= Php${total}</span>
                  </p>
                `;
        break;
      case "13th Month Pay":
        html += `
                  <p>
                    Php${formattedRateToUse} x ${period.days} ${keyword} / 12 months = Php${total}
                  </p>
                `;
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
                  establishment &&
                  `<h1>${establishment.name.toUpperCase()}</h1>

                  <table>
                    <tbody>
                      ${
                        establishment &&
                        establishment.employees &&
                        establishment.employees
                          .map(
                            (employee, index) => `
                          ${renderEmployee(index, employee)}
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
