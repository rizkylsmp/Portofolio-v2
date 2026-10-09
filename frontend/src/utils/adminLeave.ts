export function confirmAdminLeave(): boolean {
  if (document.querySelector('form[data-admin-busy="true"]')) {
    window.alert("Tunggu proses upload atau penyimpanan selesai.");
    return false;
  }
  return !document.querySelector('form[data-admin-dirty="true"]') || window.confirm("Perubahan belum disimpan. Yakin ingin meninggalkan form?");
}
