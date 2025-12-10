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
                float: right;
              }
              .space {
                font-size: 0.5rem;
              }
              .top-space {
                  margin-top: 1rem;
              }
                  .value{
                  text-align: right;
                  float:right;
                  }

              .double-underline{
                    text-decoration: underline;
                    text-decoration-style: double;
              }

              .fontSize{
                  font-size: ${isPreview ? "2.5" : "1.25"}rem;
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
<<<<<<< HEAD
                <br><p class="right double-underline">Total: Php${formatNumber(total)}</p> 
=======
                <p class="bold right">Grand Total: Php${formatNumber(grandTotal)}</p>
>>>>>>> development
                <p class="space">&nbsp</p>
              `;
    }
            //KAPAG BINUBURA YUNG "Total" na word, nawawala ang value ng Grand Total sa dulo
            //DAPAT DAW KASI SA Php magsimula ang double-underline
            //Yung pinakahuling amount daw bago may SubTotal lang daw dapat ang naka-underline
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
<<<<<<< HEAD
    const keyword = getValueKeyword(type, period.days, period.hours);
    const valueClass = isLastViolation ? "value underline" : "value";
=======
    const keyword = getValueKeyword(violationType, period.days, period.hours);
>>>>>>> development

    switch (violationType) {
      case "Basic Wage":
        if (paymentType === "Underpayment") {
          html += `
                  <p>
                    Php${formatNumber(minimumRate)} - ${formatNumber(rate)} x ${period.days} ${keyword} 
                    <span class="${valueClass}">= Php${total}</span>
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
<<<<<<< HEAD
                    Php${formattedRateToUse} / 8 x ${period.type === "Normal Day" ? "125" : "130"}% x ${period.days} day${Number(period.days) === 1 ? "" : "s"} x ${period.hours} ${keyword} 
                    <span class="${valueClass}">= Php${total}</span>
=======
                    Php${formattedRateToUse} / 8 x ${period.type === "Normal Day" ? "125" : "130"}% x ${period.days} day${parseNumber(period.days) === 1 ? "" : "s"} x ${period.hours} ${keyword} 
                    <span class="value">= Php${total}</span>
>>>>>>> development
                  </p>
                `;
        break;
      case "Night Shift Differential":
        html += `
                  <p>
                    Php${formattedRateToUse} / 8 x 10% x ${period.days} x ${period.hours} ${keyword} 
                    <span class="${valueClass}">= Php${total}</span>
                  </p>
                `;
        break;
      case "Special Day":
        html += `
                  <p>
                    Php${formattedRateToUse} x 30% x ${period.days} ${keyword} 
                    <span class="${valueClass}">= Php${total}</span>
                  </p>
                `;
        break;
      case "Rest Day":
        html += `
                  <p>
                    Php${formattedRateToUse} x 30% x ${period.days} ${keyword} 
                    <span class="right underline">= Php${total}</span>
                  </p>
                `;
        break;
      case "Holiday Pay":
        html += `
                  <p>
                    Php${formattedRateToUse} x ${period.days} ${keyword} 
                    <span class="${valueClass}">= Php${total}</span>
                  </p>
                `;
        break;
      case "13th Month Pay":
        html += `
                  <p>
                    Php${formattedRateToUse} x ${period.days} ${keyword} / 12 months <span class="right underline">= Php${total}</span>
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
                (() => {
                  let grandTotalCents = 0;

                  const employeesHTML = establishment.employees
                    .map((employee, index) => {
                      const empHTML = renderEmployee(index, employee);

                      const regex = /Total: Php([\d,]+(?:\.\d{1,2})?)/g;
                      const matches = Array.from(empHTML.matchAll(regex));

                      if (matches.length > 0) {
                        const totalStr = matches[matches.length - 1][1].replace(/,/g, "");
                        const cents = Math.round(Number(totalStr) * 100);
                        if (!isNaN(cents)) grandTotalCents += cents;
                      }
                      return empHTML;
                    })
                    .join("");

                  const grandTotal = grandTotalCents / 100;

                  return `
                    ${employeesHTML}
                    <tr>
                      <td>
                        <p class="right top-space fontSize">
                        Grand Total:
                        <span class="double-underline"> Php${formatNumber(grandTotal)}</span>
                      </p>
                      </td>
                    </tr>
                  `;
                })()
              }
              </tbody>
              </table>              `
                }
              </body>
            </html>
          `;
};

export default generateHTML;
