import {
  Employee,
  Establishment,
  PaymentType,
  Period,
  ViolationType,
  ViolationValues,
  WageOrder,
} from "@/types/globals";
import {
  calculate,
  formatDate,
  formatNumber,
  getMinimumRate,
  getSubtotal,
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
      const violationValues: ViolationValues = JSON.parse(
        employee.violations[0].values as string,
      );

      let valid = 0;
      Object.keys(violationValues).forEach((violationKey) => {
        const violationType = violationKey as ViolationType;
        Object.keys(violationValues[violationType]).forEach((paymentKey) => {
          const paymentType = paymentKey as PaymentType;

          violationValues[violationType][paymentType].forEach((period) => {
            if (
              validate(
                period,
                isHours(violationType) ? ["received"] : ["received", "hours"],
              )
            ) {
              ++valid;
            }
          });
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
      const violationValues: ViolationValues = JSON.parse(
        employee.violations[0].values as string,
      );

      let grandTotal = 0;
      Object.keys(violationValues).forEach((violationKey) => {
        const violationType = violationKey as ViolationType;
        Object.keys(violationValues[violationType]).forEach((paymentKey) => {
          const paymentType = paymentKey as PaymentType;

          grandTotal += getSubtotal(
            wageOrders,
            establishment.size,
            violationType,
            paymentType,
            violationValues[violationType][paymentType] as Period[],
          );

          let valid = 0;
          violationValues[violationType][paymentType].forEach((period) => {
            if (
              validate(
                period,
                isHours(violationType) ? ["received"] : ["received", "hours"],
              )
            ) {
              ++valid;
            }
          });

          if (valid > 0) {
            html += `
                    <p class="bold underline top-space">
                      ${paymentType} of ${getViolationKeyword(violationType)}
                    </p>

                    ${renderType(violationType, paymentType, violationValues[violationType][paymentType] as Period[])}
                  `;
          }
        });
      });

      html += `
                <p class="bold right">Grand Total: Php${formatNumber(grandTotal)}</p>
                <p class="space">&nbsp</p>
              `;
    }

    return html;
  };

  const renderType = (
    violationType: ViolationType,
    paymentType: PaymentType,
    periods: Period[],
  ) => {
    let html = "";
    let subtotal = 0;

    periods.forEach((period, index) => {
      const result = calculate(
        wageOrders,
        establishment.size,
        violationType,
        paymentType,
        period,
      );

      if (
        validate(
          period,
          isHours(violationType) ? ["received"] : ["received", "hours"],
        )
      ) {
        subtotal = subtotal + result - parseNumber(period.received);

        const value = isHours(violationType)
          ? `${parseNumber(period.days) * parseNumber(period.hours)}`
          : `${period.days}`;

        html += `
                  <p>Period${
                    periods.length > 1 ? ` ${numberToLetter(index)}` : ""
                  }: ${formatDate(period.start_date, "dd MMMM yyyy")} to ${formatDate(
                    period.end_date,
                    "dd MMMM yyyy",
                  )} (${value} ${getValueKeyword(violationType, period.days, period.hours)})
                  </p>

                  ${renderFormula(violationType, paymentType, period)}

                  ${
                    parseNumber(period.received) > 0
                      ? `
                      <p>
                        Actual Pay Received: 
                        Php${formatNumber(period.received)}
                      </p>
    
                      <p>
                        Php${formatNumber(result)} - ${formatNumber(period.received)} 
                        <span>= Php${formatNumber(result - parseNumber(period.received))}</span>
                      </p>
                    `
                      : ""
                  }
                  
                  ${index + 1 !== periods.length ? `<p class="space">&nbsp</p>` : ""}

                  `;
      }
    });

    if (periods.length > 1) {
      html += `
                <p class="right">Subtotal: Php${formatNumber(subtotal)}</p>
              `;
    }

    return html;
  };

  const renderFormula = (
    violationType: ViolationType,
    paymentType: PaymentType,
    period: Period,
  ) => {
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
      calculate(
        wageOrders,
        establishment.size,
        violationType,
        paymentType,
        period,
      ),
    );
    const keyword = getValueKeyword(violationType, period.days, period.hours);

    switch (violationType) {
      case "Basic Wage":
        if (paymentType === "Underpayment") {
          html += `
                  <p>
                    Php${formatNumber(minimumRate)} - ${formatNumber(rate)} x ${period.days} ${keyword} 
                    <span class="value">= Php${total}</span>
                  </p>
                `;
        } else {
          html += `
                  <p>
                    Php${formattedRateToUse} x ${period.days} ${keyword} 
                    <span class="value">= Php${total}</span>
                  </p>
                `;
        }

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
                    Php${formattedRateToUse} / 8 x 10% x ${period.days} day${parseNumber(period.days) === 1 ? "" : "s"} x ${period.hours} ${keyword} 
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
