d3.csv("data/data.csv").then(function(data) {
  // --- B1: Tổng số đơn hàng duy nhất ---
  let tongDonHang = new Set(data.map(d => d["Mã đơn hàng"])).size;

  // --- B2: Gom theo nhóm hàng và đếm đơn hàng duy nhất ---
  let groupedMap = d3.rollup(
    data,
    v => new Set(v.map(d => d["Mã đơn hàng"])).size,
    d => d["Mã nhóm hàng"],
    d => d["Tên nhóm hàng"]
  );

  let grouped = [];
  groupedMap.forEach((byTen, maNhom) => {
    byTen.forEach((count, tenNhom) => {
      grouped.push({
        MaNhom: maNhom,
        TenNhom: tenNhom,
        DonHang: count,
        XacSuat: count / tongDonHang,
        HienThi: `[${maNhom}] ${tenNhom}`
      });
    });
  });

  // --- Sắp xếp giảm dần theo Xác suất ---
  grouped.sort((a,b) => d3.descending(a.XacSuat, b.XacSuat));

  // --- B3: Khung vẽ ---
  const svg = d3.select("#chart7"),
        margin = {top: 40, right: 50, bottom: 40, left: 300},
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom;

  const g = svg.append("g")
               .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear()
              .domain([0, d3.max(grouped, d => d.XacSuat)])
              .nice()
              .range([0, width]);

  const y = d3.scaleBand()
              .domain(grouped.map(d => d.HienThi))
              .range([0, height])
              .padding(0.2);

  // --- Màu 12 màu custom ---
  const colors = [
    "#264D59", "#43978D", "#F9E07F", "#F9AD6A", "#D46C4E",
    "#5AA7A7", "#96D7C6", "#BAC94A", "#E2D36B", "#6C8CBF",
    "#FF7B89", "#8A5082"
  ];
  const color = d3.scaleOrdinal()
                  .domain(grouped.map(d => d.MaNhom))
                  .range(colors);

  // --- Trục X (format %) ---
  g.append("g")
   .attr("transform", `translate(0,${height})`)
   .call(d3.axisBottom(x).tickFormat(d3.format(".0%")))
   .selectAll("text")
   .style("font-weight", "bold")
   .style("font-size", "15px");

  // --- Trục Y ---
  g.append("g")
   .call(d3.axisLeft(y))
   .selectAll("text")
   .style("font-size", "15px")
   .style("font-weight", "bold");

  // --- Vẽ cột ---
  g.selectAll("rect")
    .data(grouped)
    .enter().append("rect")
      .attr("y", d => y(d.HienThi))
      .attr("x", 0)
      .attr("width", d => x(d.XacSuat))
      .attr("height", y.bandwidth())
      .attr("fill", d => color(d.MaNhom))
      .append("title")
        .text(d => `${d.HienThi}\nXác suất: ${(d.XacSuat*100).toFixed(2)}%`);

  // --- Chú thích text trên cột ---
  g.selectAll("text.value")
    .data(grouped)
    .enter().append("text")
      .attr("class", "value")
      .attr("x", d => x(d.XacSuat) + 5)
      .attr("y", d => y(d.HienThi) + y.bandwidth()/2 + 5)
      .text(d => (d.XacSuat*100).toFixed(1) + "%")
      .style("font-size", "13px")
      .style("font-weight", "bold")
      .style("fill", "#333");


});
