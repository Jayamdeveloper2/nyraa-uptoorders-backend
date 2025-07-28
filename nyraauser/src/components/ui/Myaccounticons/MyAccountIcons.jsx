import { 
  Mail, 
  Phone, 
  User, 
  Calendar, 
  Check, 
  X, 
  Edit,
  Home,
  Briefcase,
  MapPin,
  Eye,
  FileText,
  Package,
  Download,
  ArrowLeft,
  Undo2
} from 'lucide-react';
import { FaSignOutAlt } from 'react-icons/fa';
import { 
  FiSave, 
  FiX, 
  FiEdit2, 
  FiCheckCircle, 
  FiPlus, 
  FiRefreshCw, 
  FiTrash2 
} from 'react-icons/fi';
import { BiLogOut } from 'react-icons/bi';
import { MdCancel } from 'react-icons/md';

// Standard icon size
const ICON_SIZE = 20;

// Basic icons
export const MailIcon = ({ className = '' }) => (
  <Mail size={ICON_SIZE} className={className} />
);

export const PhoneIcon = ({ className = '' }) => (
  <Phone size={ICON_SIZE} className={className} />
);

export const UserIcon = ({ className = '' }) => (
  <User size={ICON_SIZE} className={className} />
);

export const CalendarIcon = ({ className = '' }) => (
  <Calendar size={ICON_SIZE} className={className} />
);

export const CheckIcon = ({ className = '' }) => (
  <Check size={ICON_SIZE} className={className} />
);

export const XIcon = ({ className = '' }) => (
  <X size={ICON_SIZE} className={className} />
);

export const EditIcon = ({ className = '' }) => (
  <Edit size={ICON_SIZE} className={className} />
);

export const SignOutIcon = ({ className = '' }) => (
  <FaSignOutAlt size={ICON_SIZE} className={className} />
);

// Address type icons
export const HomeIcon = ({ className = '' }) => (
  <Home size={ICON_SIZE} className={className} />
);

export const WorkIcon = ({ className = '' }) => (
  <Briefcase size={ICON_SIZE} className={className} />
);

export const MapPinIcon = ({ className = '' }) => (
  <MapPin size={ICON_SIZE} className={className} />
);

// Action icons
export const SaveIcon = ({ className = '' }) => (
  <FiSave size={ICON_SIZE} className={className} />
);

export const CloseIcon = ({ className = '' }) => (
  <FiX size={ICON_SIZE} className={className} />
);

export const Edit2Icon = ({ className = '' }) => (
  <FiEdit2 size={ICON_SIZE} className={className} />
);

export const CheckCircleIcon = ({ className = '' }) => (
  <FiCheckCircle size={ICON_SIZE} className={className} />
);

export const PlusIcon = ({ className = '' }) => (
  <FiPlus size={ICON_SIZE} className={className} />
);

export const RefreshIcon = ({ className = '' }) => (
  <FiRefreshCw size={ICON_SIZE} className={className} />
);

export const TrashIcon = ({ className = '' }) => (
  <FiTrash2 size={ICON_SIZE} className={className} />
);

export const LogOutIcon = ({ className = '' }) => (
  <BiLogOut size={ICON_SIZE} className={className} />
);

// Order-specific icons
export const ViewIcon = ({ className = '' }) => (
  <Eye size={ICON_SIZE} className={className} />
);

export const InvoiceIcon = ({ className = '' }) => (
  <FileText size={ICON_SIZE} className={className} />
);

export const CancelIcon = ({ className = '' }) => (
  <MdCancel size={ICON_SIZE} className={className} />
);

export const TrackIcon = ({ className = '' }) => (
  <Package size={ICON_SIZE} className={className} />
);

// Invoice-specific icons
export const DownloadIcon = ({ className = '' }) => (
  <Download size={ICON_SIZE} className={className} />
);

export const ArrowLeftIcon = ({ className = '' }) => (
  <ArrowLeft size={ICON_SIZE} className={className} />
);

// Return-specific icon
export const ReturnIcon = ({ className = '' }) => (
  <Undo2 size={ICON_SIZE} className={className} />
);