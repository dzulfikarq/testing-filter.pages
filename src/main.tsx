import { StrictMode, useCallback, useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";

import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";

const LOCATION_KEY = "data_local";

type LocationData = {
  province_id?: string;
  regency_id?: string;
  district_id?: string;
};

type Province = {
  id: number;
  name: string;
};

type Regency = {
  id: number;
  name: string;
  province_id: number;
};

type District = {
  id: number;
  name: string;
  regency_id: number;
};

type LoadingData = {
  province: boolean;
  regency: boolean;
  district: boolean;
};

const SelectLoading = () => {
  return (
    <div className="mx-auto w-full max-w-sm rounded-md border p-4 h-[36px] mt-2">
      <div className="h-2 rounded bg-gray-200"></div>
    </div>
  );
};

// Komponen ini merangkum seluruh kebutuhan dalam satu halaman.
export default function FilterPage() {
  const [dataProvinsi, setDataProvinsi] = useState<Province[]>([]);
  const [dataRegency, setDataRegency] = useState<Regency[]>([]);
  const [dataDistrict, setDataDistrict] = useState<District[]>([]);

  const [loading, setLoading] = useState<LoadingData>({
    province: true,
    regency: true,
    district: true,
  });

  const getLocation = () => {
    try {
      const data = localStorage.getItem(LOCATION_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      return null;
    }
  };

  const [selectedLocation, setSelectedLocation] = useState<LocationData>(() =>
    getLocation()
  );

  const resetFilter = () => {
    setSelectedLocation({
      province_id: "",
      regency_id: "",
      district_id: "",
    });
    localStorage.removeItem(LOCATION_KEY);
  };

  const setLocalData = useCallback(
    (value: LocationData) => {
      const newValue = { ...selectedLocation, ...value };
      setSelectedLocation(newValue);
      localStorage.setItem(LOCATION_KEY, JSON.stringify(newValue));
    },
    [selectedLocation]
  );

  // Mengambil data dari local json
  useEffect(() => {
    fetch("/data/province.json")
      .then((res) => res.json())
      .then((data) => {
        setDataProvinsi(data);
        setLoading((prev) => ({ ...prev, province: false }));
      });

    fetch("/data/regencies.json")
      .then((res) => res.json())
      .then((data) => {
        setDataRegency(data);
        setLoading((prev) => ({ ...prev, regency: false }));
      });

    fetch("/data/district.json")
      .then((res) => res.json())
      .then((data) => {
        setDataDistrict(data);
        setLoading((prev) => ({ ...prev, district: false }));
      });
  }, []);

  const filteredRegency = useMemo(() => {
    return dataRegency.filter(
      (r) => r.province_id === Number(selectedLocation?.province_id)
    );
  }, [dataRegency, selectedLocation?.province_id]);

  const filteredDistrict = useMemo(() => {
    return dataDistrict.filter(
      (r) => r.regency_id === Number(selectedLocation?.regency_id)
    );
  }, [dataDistrict, selectedLocation?.regency_id]);

  const provinceName = dataProvinsi.find(
    (p) => p.id === Number(selectedLocation?.province_id)
  )?.name;
  const regencyName = dataRegency.find(
    (r) => r.id === Number(selectedLocation?.regency_id)
  )?.name;
  const districtName = dataDistrict.find(
    (d) => d.id === Number(selectedLocation?.district_id)
  )?.name;

  return (
    <>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <div className="border-b bg-white px-6 py-3 flex items-center gap-4">
          <div className="font-semibold text-gray-700">Frontend Assessment</div>

          <div className="text-sm text-gray-400 flex gap-2">
            <span>Indonesia</span>
            <span>›</span>
            <span>{provinceName}</span>
            <span>›</span>
            <span>{regencyName}</span>
            <span>›</span>
            <span className="text-blue-500">{districtName}</span>
          </div>
        </div>

        <div className="flex flex-1">
          {/* Sidebar */}
          <div className="w-72 bg-white border-r p-6">
            <div className="text-xs text-gray-400 mb-4 tracking-wider">
              FILTER WILAYAH
            </div>

            {/* Provinsi */}
            <div className="mb-5">
              <label className="text-xs text-gray-500">PROVINSI</label>
              {loading.province ? (
                <SelectLoading />
              ) : (
                <select
                  className="w-full mt-2 border rounded-lg px-3 py-2 text-sm text-black"
                  value={selectedLocation?.province_id}
                  onChange={(e) => {
                    setLocalData({
                      province_id: e.target.value ?? '',
                    });
                  }}
                >
                  <option value="">Pilih Provinsi</option>
                  {dataProvinsi.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Kota */}
            <div className="mb-5">
              <label className="text-xs text-gray-500">KOTA/KABUPATEN</label>
              {loading.regency ? (
                <SelectLoading />
              ) : (
                <select
                  className="w-full mt-2 border rounded-lg px-3 py-2 text-sm text-black"
                  value={selectedLocation?.regency_id}
                  onChange={(e) => {
                    setLocalData({
                      regency_id: e.target.value ?? '',
                    });
                  }}
                >
                  <option value="">Pilih Kota/Kabupaten</option>
                  {filteredRegency.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Kecamatan */}
            <div className="mb-6">
              <label className="text-xs text-gray-500">KECAMATAN</label>
              {loading.district ? (
                <SelectLoading />
              ) : (
                <select
                  className="w-full mt-2 border rounded-lg px-3 py-2 text-sm text-black"
                  value={selectedLocation?.district_id}
                  onChange={(e) => {
                    setLocalData({
                      district_id: e.target.value ?? '',
                    });
                  }}
                >
                  <option value="">Pilih Kecamatan</option>
                  {filteredDistrict.map((r: any) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <button
              onClick={resetFilter}
              className="w-full border border-blue-500 text-blue-500 rounded-lg py-2 text-sm hover:bg-blue-50"
            >
              Reset
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="mb-16">
              <div className="text-xs tracking-widest text-blue-400 mb-2">
                PROVINSI
              </div>
              <div className="text-5xl font-semibold text-gray-800">
                {provinceName || "-"}
              </div>
            </div>

            <div className="mb-16">
              <div className="text-xs tracking-widest text-blue-400 mb-2">
                KOTA / KABUPATEN
              </div>
              <div className="text-4xl font-semibold text-gray-800">
                {regencyName || "-"}
              </div>
            </div>

            <div>
              <div className="text-xs tracking-widest text-blue-400 mb-2">
                KECAMATAN
              </div>
              <div className="text-3xl font-semibold text-gray-800">
                {districtName || "-"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <div>Hello World</div>,
  },
  {
    path: "/filter",
    element: <FilterPage />,
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
