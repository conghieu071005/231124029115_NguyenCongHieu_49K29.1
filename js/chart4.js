d3.csv("data/data.csv").then(function(data) {
  // Chuẩn hóa dữ liệu
  data.forEach(d => {
    d.SL = +d["SL"];
    d.DonGia = +d["Đơn giá"];
    d.ThanhTien = +d["Thành tiền"];
    d.Ngay = new Date(d["Thời gian tạo đơn"]);
  });

  // Gom theo ngày (tính tổng trong ngày)
  let dailyMap = d3.rollup(
    data,
    v => ({
      TongDoanhThu: d3.sum(v, d => d.ThanhTien),
      TongSKU: d3.sum(v, d => d.SL)
    }),
    d => d3.timeDay(d.Ngay)
  );

  let daily = [];
  dailyMap.forEach((val, ngay) => {
    daily.push({
      Ngay: ngay,
      TongDoanhThu: val.TongDoanhThu,
      TongSKU: val.TongSKU,
      Thu: ngay.getDay() === 0 ? 6 : ngay.getDay() - 1
    });
  });

  const thuMap = {0:"Thứ 2",1:"Thứ 3",2:"Thứ 4",3:"Thứ 5",4:"Thứ 6",5:"Thứ 7",6:"CN"};

  // Gom theo Thứ -> tính trung bình
  let groupedMap = d3.rollup(
    daily,
    v => ({
      DoanhThuTB: d3.mean(v, d => d.TongDoanhThu),
      SKUTB: d3.mean(v, d => d.TongSKU)
    }),
    d => d.Thu
  );

  let grouped = [];
  groupedMap.forEach((val, thu) => {
    grouped.push({
      Thu: thu,
      ThuHienThi: thuMap[thu],
      DoanhThuTB: val.DoanhThuTB,
      SKUTB: val.SKUTB
    });
  });

  grouped.sort((a,b) => d3.ascending(a.Thu, b.Thu));

  // Khung vẽ
  const svg = d3.select("#chart4"),
        margin = {top: 40, right: 50, bottom: 50, left: 100},
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom;

  const g = svg.append("g")
               .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleBand()
              .domain(grouped.map(d => d.ThuHienThi))
              .range([0, width])
              .padding(0.3);

  const y = d3.scaleLinear()
              .domain([0, d3.max(grouped, d => d.DoanhThuTB)])
              .range([height, 0]);

  // 🎨 12 màu từ 2 ảnh bạn gửi
  const colors = [
    "#264D59","#43978D","#F9E07F","#F9AD6A","#D46C4E",
    "#FF7B89","#8A5082","#6F5F90","#758EB7","#A5CAD2",
    "#455054","#308695"
  ];
  const color = d3.scaleOrdinal()
                  .domain(grouped.map(d => d.ThuHienThi))
                  .range(colors);

  // 👉 Trục X
  g.append("g")
   .attr("transform", `translate(0,${height})`)
   .call(d3.axisBottom(x))
   .selectAll("text")
   .style("font-size", "18px")
   .style("font-weight", "bold");

  // 👉 Trục Y (triệu VND)
  g.append("g")
   .call(d3.axisLeft(y).tickFormat(d => (d/1e6).toFixed(0) + "M"))
   .selectAll("text")
   .style("font-size", "13px")
   .style("font-weight", "bold");

  // Vẽ cột
  g.selectAll("rect")
    .data(grouped)
    .enter().append("rect")
      .attr("x", d => x(d.ThuHienThi))
      .attr("y", d => y(d.DoanhThuTB))
      .attr("width", x.bandwidth())
      .attr("height", d => height - y(d.DoanhThuTB))
      .attr("fill", d => color(d.ThuHienThi))
      .append("title")
        .text(d => `${d.ThuHienThi}\nDoanh thu TB: ${d3.format(",.0f")(d.DoanhThuTB)} VND\nSKU TB: ${Math.round(d.SKUTB)}`);

  // 👉 Nhãn trên cột
  g.selectAll("text.value")
    .data(grouped)
    .enter().append("text")
      .attr("class", "value")
      .attr("x", d => x(d.ThuHienThi) + x.bandwidth() / 2)
      .attr("y", d => y(d.DoanhThuTB) - 5)
      .attr("text-anchor", "middle")
      .text(d => (d.DoanhThuTB / 1e6).toFixed(1) + "M")
      .style("font-size", "15px")
      .style("fill", "#333")
      .style("font-weight", "bold");


});
