import Navbar from "./Navbar";

export default function Base({ children }) {
    return(
        <div>
            <Navbar/>
            {children}
        </div>
    );
}