import { SvgIcon, type SvgIconProps } from '@mui/material';

export default function LoginIcon(props: SvgIconProps) {
    return (
        <SvgIcon {...props} viewBox="0 0 24 24">
            {/* door */}
            <path
                d="M14 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21H14"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {/* arrow */}
            <path
                d="M10 17L15 12L10 7"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <line
                x1="15"
                y1="12"
                x2="3"
                y2="12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
            />
        </SvgIcon>
    );
}