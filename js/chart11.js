// js/chart11.js — Câu 11
// Phân phối mức độ mua lặp lại của khách hàng

d3.csv("data/data.csv").then(function (rows) {
  const KH_COL = "Mã khách hàng";
  const DH_COL = "Mã đơn hàng";

  // Gom đơn hàng theo khách hàng
  const custToOrders = new Map();
  rows.forEach(d => {
    const kh = d[KH_COL];
    const dh = d[DH_COL];
    if (!kh || !dh) return;
    if (!custToOrders.has(kh)) custToOrders.set(kh, new Set());
    custToOrders.get(kh).add(dh);
  });

  // Đếm số lần mua lại
  const freq = new Map();
  custToOrders.forEach(set => {
    const count = set.size;
    freq.set(count, (freq.get(count) || 0) + 1);
  });

  const data = Array.from(freq, ([repeat, customers]) => ({
    repeat: +repeat,
    customers: +customers
  })).sort((a, b) => a.repeat - b.repeat);

  const svg = d3.select("#chart11");
  const W = +svg.attr("width");
  const H = +svg.attr("height");
  const margin = { top: 40, right: 20, bottom: 60, left: 70 };
  const innerW = W - margin.left - margin.right;
  const innerH = H - margin.top - margin.bottom;

  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleBand()
    .domain(data.map(d => d.repeat))
    .range([0, innerW])
    .padding(0.2);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.customers) * 1.1])
    .nice()
    .range([innerH, 0]);

  // --- 12 màu custom ---
  const colors = [
    "#264D59", "#43978D", "#F9E07F", "#F9AD6A", "#D46C4E",
    "#5AA7A7", "#96D7C6", "#BAC94A", "#E2D36B", "#6C8CBF",
    "#FF7B89", "#8A5082"
  ];
  const color = d3.scaleOrdinal()
    .domain(data.map(d => d.repeat))
    .range(colors);

  // --- Trục X ---
  g.append("g")
    .attr("transform", `translate(0,${innerH})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .style("font-weight", "bold")
    .style("font-size", "12px");

  // --- Trục Y ---
  g.append("g")
    .call(d3.axisLeft(y))
    .selectAll("text")
    .style("font-weight", "bold")
    .style("font-size", "12px");

  // --- Vẽ bar + tooltip ---
  g.selectAll(".bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", d => x(d.repeat))
    .attr("y", d => y(d.customers))
    .attr("width", x.bandwidth())
    .attr("height", d => innerH - y(d.customers))
    .attr("fill", d => color(d.repeat))
    .append("title")
    .text(d => `Số lần mua: ${d.repeat}\nSố KH: ${d.customers}`);

  // --- Nhãn trên cột ---
  g.selectAll(".label")
    .data(data)
    .enter()
    .append("text")
    .attr("x", d => x(d.repeat) + x.bandwidth() / 2)
    .attr("y", d => y(d.customers) - 5)
    .attr("text-anchor", "middle")
    .style("font-size", "12px")
    .style("font-weight", "bold")
    .text(d => d.customers);



  // --- Nhãn trục X ---
  svg.append("text")
    .attr("x", W / 2)
    .attr("y", H - 10)
    .attr("text-anchor", "middle")
    .style("font-size", "12px")
    .style("font-weight", "bold")
    .text("Số lần mua lặp lại");

  // --- Nhãn trục Y ---
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -H / 2)
    .attr("y", 15)
    .attr("text-anchor", "middle")
    .style("font-size", "12px")
    .style("font-weight", "bold")
    .text("Số lượng khách hàng");


});
