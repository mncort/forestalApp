import { Document, Page, View, Text } from '@react-pdf/renderer';
import { styles } from './presupuestoStyles';

export default function PresupuestoPDF({ data }) {
  const { presupuestoId, fecha, cliente, tipoFactura, items, totales } = data;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ENCABEZADO CON LOGO Y INFO DE EMPRESA */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
            paddingBottom: 12,
            borderBottomWidth: 2,
            borderBottomColor: '#2563eb'
          }}
        >
          <View>
            <Text style={{ fontSize: 18, fontWeight: 700, color: '#2563eb' }}>Forestal Tigre</Text>
            <Text style={{ fontSize: 9, color: '#666', marginTop: 2 }}>CUIT: 20-00000000-0</Text>
            <Text style={{ fontSize: 9, color: '#666' }}>Tigre, Buenos Aires</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 16, fontWeight: 700 }}>PRESUPUESTO</Text>
            <Text style={{ fontSize: 11, marginTop: 2 }}>N° {presupuestoId}</Text>
            <Text style={{ fontSize: 9, color: '#666' }}>{fecha}</Text>
          </View>
        </View>

        {/* INFORMACIÓN DEL CLIENTE */}
        <View style={styles.infoSection}>
          <Text style={styles.infoLabel}>Cliente</Text>
          <Text style={styles.infoValue}>{cliente || 'N/A'}</Text>
        </View>

        {/* TIPO DE FACTURA */}
        <View style={styles.infoSection}>
          <Text style={styles.infoLabel}>Tipo de Factura</Text>
          <Text style={styles.infoValue}>{tipoFactura}</Text>
        </View>

        {/* TABLA DE PRODUCTOS */}
        <View style={styles.table}>
          {/* Encabezado */}
          <View style={styles.tableHead}>
            <Text style={styles.colSKU}>SKU</Text>
            <Text style={styles.colNombre}>Producto</Text>
            <Text style={styles.colCantidad}>Cant.</Text>
            <Text style={styles.colPrecio}>Precio Unit.</Text>
            <Text style={styles.colSubtotal}>Subtotal</Text>
          </View>

          {/* Filas */}
          {items?.map((item, index) => (
            <View
              key={index}
              style={[styles.tableRow, index % 2 === 0 && styles.tableRowEven]}
              wrap={false}
            >
              <Text style={styles.colSKU}>{item.sku}</Text>
              <Text style={styles.colNombre}>{item.nombre}</Text>
              <Text style={styles.colCantidad}>{item.cantidad}</Text>
              <Text style={styles.colPrecio}>{item.precioFmt}</Text>
              <Text style={styles.colSubtotal}>{item.subtotalFmt}</Text>
            </View>
          ))}
        </View>

        {/* TOTALES */}
        <View style={styles.totalsContainer}>
          <View style={styles.totalRow}>
            <Text>Subtotal:</Text>
            <Text>{totales.subtotalFmt}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>IVA ({totales.porcentajeImpuesto}%):</Text>
            <Text>{totales.impuestosFmt}</Text>
          </View>
          <View style={[styles.totalRow, styles.totalRowFinal]}>
            <Text>TOTAL:</Text>
            <Text>{totales.totalFmt}</Text>
          </View>
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text>Presupuesto generado el {new Date().toLocaleString('es-AR')}</Text>
        </View>

        {/* NUMERACIÓN DE PÁGINAS */}
        <Text
          style={{
            position: 'absolute',
            bottom: 20,
            right: 36,
            fontSize: 9,
            color: '#555'
          }}
          render={({ pageNumber, totalPages }) =>
            `Página ${pageNumber} de ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  );
}
