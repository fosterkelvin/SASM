
interface HeaderInfoProps {
  month?: string;
  name?: string;
  department?: string;
  dutyHours?: string;
}

const HeaderInfo = ({
  month = "",
  name = "",
  department = "",
  dutyHours = "",
}: HeaderInfoProps) => {
  return (
    <div className="border rounded-md p-4 bg-blue-50 dark:bg-blue-900/30">
      <div className="flex justify-between items-start">
        <div>

        </div>
        <div className="text-sm text-right">
          <div>
            Month: <strong>{month}</strong>
          </div>
          <div>
            Name: <strong>{name}</strong>
          </div>
          <div>
            Department: <strong>{department}</strong>
          </div>
          <div>
            Duty Hours: <strong>{dutyHours}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderInfo;
